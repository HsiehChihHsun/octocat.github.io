/**
 * physics.js
 * Handles all optical calculations, color science, and spectral logic.
 */

// ==========================================
// 1. Color Science (Wavelength -> RGB)
// ==========================================

/**
 * Converts wavelength and intensity to a CSS RGBA string.
 * Based on user-provided logic (Bruton Algorithm + Intensity Compression).
 */
function spectralColorConverter(wavelength, intensity, dynamicRange = 2.0) {
    let R, G, B, alpha;

    // 1. Bruton Algorithm approximation for RGB
    // Clamp wavelength for color calculation to 380-750 range if outside
    let effectiveWl = wavelength;
    if (wavelength < 380) effectiveWl = 380;
    if (wavelength > 750) effectiveWl = 750;

    if (effectiveWl >= 380 && effectiveWl < 440) {
        R = -(effectiveWl - 440) / (440 - 380);
        G = 0.0;
        B = 1.0;
    } else if (effectiveWl >= 440 && effectiveWl < 490) {
        R = 0.0;
        G = (effectiveWl - 440) / (490 - 440);
        B = 1.0;
    } else if (effectiveWl >= 490 && effectiveWl < 510) {
        R = 0.0;
        G = 1.0;
        B = -(effectiveWl - 510) / (510 - 490);
    } else if (effectiveWl >= 510 && effectiveWl < 580) {
        R = (effectiveWl - 510) / (580 - 510);
        G = 1.0;
        B = 0.0;
    } else if (effectiveWl >= 580 && effectiveWl < 645) {
        R = 1.0;
        G = -(effectiveWl - 645) / (645 - 580);
        B = 0.0;
    } else if (effectiveWl >= 645 && effectiveWl <= 750) {
        R = 1.0;
        G = 0.0;
        B = 0.0;
    } else {
        R = 0.0; G = 0.0; B = 0.0;
    }

    // 2. Vision Attenuation (Falloff at edges)
    // Extended Range: 350-780nm.
    // We want lines < 380 to be visible (purple) and > 750 (red).
    // Original logic dropped to 0.0 outside [380, 750].
    // Let's CLAMP the wavelength used for lookups to [380, 750] for attenuation purposes,
    // OR just set attenuation to a minimum visible value (e.g., 0.3) for these "invisible" ranges.

    // Using Clamp strategy on 'effectiveWl' (already clamped above) for color,
    // let's do similar for attenuation to ensure visibility.

    let wlForAtt = wavelength;
    if (wlForAtt < 380) wlForAtt = 380; // Treat UV as 380nm visibility
    if (wlForAtt > 750) wlForAtt = 750; // Treat IR as 750nm visibility

    let visionAttenuation = 1.0;
    if (wlForAtt >= 380 && wlForAtt < 420) {
        visionAttenuation = 0.3 + 0.7 * (wlForAtt - 380) / (420 - 380);
    } else if (wlForAtt >= 420 && wlForAtt < 700) {
        visionAttenuation = 1.0;
    } else if (wlForAtt >= 700 && wlForAtt <= 750) {
        visionAttenuation = 0.3 + 0.7 * (750 - wlForAtt) / (750 - 700);
    } else {
        visionAttenuation = 0.0; // Should not reach here due to clamp
    }

    // 3. Dynamic Range Compression
    const safeIntensity = Math.max(0, intensity);
    const compressedIntensity = Math.pow(safeIntensity, 1 / dynamicRange);

    // 4. Final Alpha
    alpha = compressedIntensity * visionAttenuation;

    // 5. RGB Pre-emphasis (Gamma) for better display
    const Gamma = 0.8;
    // We actually want the "Color" to be pure, and Alpha to handle brightness/fading for the ray drawing.
    // But for the spectral bar, we might want solid colors.
    // For rays on black background, returning rgba with alpha is best.

    // Apply gamma to the base color factors just to sharpen the "hue" perception if needed,
    // but the original algorithm applies it to the final R,G,B.
    // Here we will keep the base R,G,B pure for the hue, and use alpha for intensity.

    // NOTE: For the simulation rays, we want them to add up.

    // Let's refine the R,G,B output to be 0-255 based on the hue.
    const R_base = Math.round(R * 255);
    const G_base = Math.round(G * 255);
    const B_base = Math.round(B * 255);

    return {
        r: R_base,
        g: G_base,
        b: B_base,
        a: alpha,
        css: `rgba(${R_base}, ${G_base}, ${B_base}, ${alpha.toFixed(3)})`
    };
}

/**
 * Calculates the mixed "Base Color" of the light source.
 */
function calculateMixedColor(lines) {
    let totalR = 0;
    let totalG = 0;
    let totalB = 0;

    // We use a simplified version of spectralColorConverter logic internal here for summing
    lines.forEach(line => {
        let wl = line.wavelength;

        // Clamp for Color (380-750)
        let effectiveWl = wl;
        if (wl < 380) effectiveWl = 380;
        if (wl > 750) effectiveWl = 750;

        let R = 0, G = 0, B = 0;

        // Simplified Bruton for mixing using effectiveWl
        if (effectiveWl >= 380 && effectiveWl < 440) { R = -(effectiveWl - 440) / (440 - 380); B = 1.0; }
        else if (effectiveWl >= 440 && effectiveWl < 490) { G = (effectiveWl - 440) / (490 - 440); B = 1.0; }
        else if (effectiveWl >= 490 && effectiveWl < 510) { G = 1.0; B = -(effectiveWl - 510) / (510 - 490); }
        else if (effectiveWl >= 510 && effectiveWl < 580) { R = (effectiveWl - 510) / (580 - 510); G = 1.0; }
        else if (effectiveWl >= 580 && effectiveWl < 645) { R = 1.0; G = -(effectiveWl - 645) / (645 - 580); }
        else if (effectiveWl >= 645 && effectiveWl <= 750) { R = 1.0; }

        // Vision Attenuation (Clamped for visibility)
        let wlForAtt = wl;
        if (wlForAtt < 380) wlForAtt = 380;
        if (wlForAtt > 750) wlForAtt = 750;

        let att = 1.0;
        if (wlForAtt >= 380 && wlForAtt < 420) att = 0.3 + 0.7 * (wlForAtt - 380) / 40;
        else if (wlForAtt >= 420 && wlForAtt < 700) att = 1.0;
        else if (wlForAtt >= 700 && wlForAtt <= 750) att = 0.3 + 0.7 * (750 - wlForAtt) / 50;
        else att = 0.0;

        // Add to total
        let intensity = line.intensity;
        totalR += R * att * intensity;
        totalG += G * att * intensity;
        totalB += B * att * intensity;
    });

    if (totalR + totalG + totalB < 1e-9) {
        return { r: 100, g: 100, b: 100, isFallback: true }; // Fallback gray
    }

    // Normalize to max 255
    let maxVal = Math.max(totalR, totalG, totalB);
    let scale = 255 / maxVal;

    // Use a slight gamma / brightness boost for the base lamp look
    let finalR = Math.min(255, Math.round(totalR * scale));
    let finalG = Math.min(255, Math.round(totalG * scale));
    let finalB = Math.min(255, Math.round(totalB * scale));

    return { r: finalR, g: finalG, b: finalB, isFallback: false };
}

// ==========================================
// 2. Optics & Snell's Law
// ==========================================

/**
 * Returns the refractive index of the prism for a given wavelength.
 * Uses Cauchy's Equation: n(lambda) = A + B / lambda^2
 * 
 * To make dispersion visible on a small screen, we must EXAGGERATE B.
 * Real glass B is distinct but small. We will multiply it.
 */
function getRefractiveIndex(wavelengthNm, scale = 1.0) {
    // Parameters for a high-dispersion "flint glass" simulation
    // A ~ 1.6
    // B ~ usually 0.01 for micrometers.
    // Let's tune for our 380-750 scale to get a good spread of angles.

    // We want the deflection range to be maybe 10-20 degrees difference between red and violet?

    // Base Index A
    const A = 1.50;
    // Dispersion Coefficient B (Exaggerated)
    // lambda is in nm, so convert to micrometer or just adjust constant scaling.
    // Let's use mu meters: 500nm = 0.5um

    const lambdaUm = wavelengthNm / 1000;
    const B = 0.05 * scale; // High dispersion, scaled by user

    return A + B / (lambdaUm * lambdaUm);
}


/**
 * Snell's Law: n1 * sin(theta1) = n2 * sin(theta2)
 * Returns the output angle (relative to normal) in radians.
 * Returns null if Total Internal Reflection occurs.
 */
function snell(n1, n2, theta1) {
    const sinTheta2 = (n1 / n2) * Math.sin(theta1);
    if (Math.abs(sinTheta2) > 1.0) return null; // TIR
    return Math.asin(sinTheta2);
}

