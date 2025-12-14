import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';

// --- Configuration ---
const CONFIG = {
    fov: 60,
    bloomStrength: 1.5,
    bloomRadius: 0.4,
    bloomThreshold: 0.1
};

// --- Scene Setup ---
const container = document.getElementById('container');
const scene = new THREE.Scene();

// Camera setup
const camera = new THREE.PerspectiveCamera(CONFIG.fov, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(0, 2, 8); // Initial position

const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: "high-performance" });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2)); // Limit pixel ratio for performance
container.appendChild(renderer.domElement);

// Controls
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.05;
controls.minDistance = 2.5;
controls.maxDistance = 20;

// --- Shaders ---

const vertexShader = `
    varying vec2 vUv;
    void main() {
        vUv = uv;
        // Always fill the screen (NDC coordinates -1 to 1)
        // Ignoring modelViewMatrix and projectionMatrix allows the quad to act as a screen overlay
        gl_Position = vec4(position, 1.0); 
    }
`;

const fragmentShader = `
    uniform float iTime;
    uniform vec2 iResolution;
    uniform vec3 cameraPos;
    uniform vec3 cameraLookAt;

    varying vec2 vUv;

    // --- Constants (常數設定) ---
    #define MAX_STEPS 300        // 最大步數 (Increased for finer detail)
    #define STEP_SIZE 0.1        // 基本步長
    #define BEND_STRENGTH 1.5    // 引力透鏡強度
    #define BH_RADIUS 0.5        // 黑洞事件視界半徑 (Shrunk as requested)
    #define ACCRETION_INNER 1.0  // 吸積盤內徑 (Adjusted relative to BH_RADIUS)
    #define ACCRETION_OUTER 5.0  // 吸積盤外徑 (Widened slightly)
    #define ACCRETION_HEIGHT 0.1 // 吸積盤厚度
    
    #define PI 3.14159265359

    // --- Noise Functions (噪聲函數) ---
    // 簡單的哈希函數
    float hash(float n) { return fract(sin(n) * 1e4); }
    float hash(vec2 p) { return fract(1e4 * sin(17.0 * p.x + p.y * 0.1) * (0.1 + abs(sin(p.y * 13.0 + p.x)))); }

    // 3D 噪聲函數，用於生成吸積盤紋理
    float noise(vec3 x) {
        const vec3 step = vec3(110, 241, 171);
        vec3 i = floor(x);
        vec3 f = fract(x);
        float n = dot(i, step);
        vec3 u = f * f * (3.0 - 2.0 * f);
        return mix(mix(mix( hash(n + dot(step, vec3(0, 0, 0))), hash(n + dot(step, vec3(1, 0, 0))), u.x),
                       mix( hash(n + dot(step, vec3(0, 1, 0))), hash(n + dot(step, vec3(1, 1, 0))), u.x), u.y),
                   mix(mix( hash(n + dot(step, vec3(0, 0, 1))), hash(n + dot(step, vec3(1, 0, 1))), u.x),
                       mix( hash(n + dot(step, vec3(0, 1, 1))), hash(n + dot(step, vec3(1, 1, 1))), u.x), u.y), u.z);
    }

    // 分形布朗運動 (FBM) 用於製造雲霧感
    float fbm(vec3 p) {
        float v = 0.0;
        float a = 0.5;
        for (int i = 0; i < 4; i++) {
            v += a * noise(p);
            p = p * 2.0;
            a *= 0.5;
        }
        return v;
    }

    // --- Physics & Intersection (物理與求交) ---

    // 計算吸積盤的體積密度
    // param p: 當前光線位置
    float getAccretionDensity(vec3 p) {
        float r = length(p.xz); // 到中心的水平距離
        float h = abs(p.y);     // 垂直高度

        // 檢查是否在吸積盤幾何範圍內
        if (r < ACCRETION_INNER || r > ACCRETION_OUTER || h > ACCRETION_HEIGHT) return 0.0;

        // 計算旋轉動畫 (基於時間和極座標角度)
        float angle = atan(p.z, p.x);
        // 旋轉速度隨距離衰減 (開普勒定律近似)
        float speed = 2.0 / (r * r + 0.1); 
        float animation = iTime * speed;
        
        // 採樣噪聲
        // 降低垂直方向的噪聲頻率以減少鋸齒 h * 10.0 -> h * 4.0
        // Use + animation for Counter-Clockwise visual rotation (matches CCW physics)
        vec3 noisePos = vec3(r * 2.0, angle * 3.0 + animation, h * 4.0);
        float density = fbm(noisePos);
        
        // 邊緣淡出效果 (Soft edges)
        float fade = smoothstep(ACCRETION_INNER, ACCRETION_INNER + 0.5, r) * 
                     smoothstep(ACCRETION_OUTER, ACCRETION_OUTER - 1.0, r) *
                     smoothstep(ACCRETION_HEIGHT, 0.0, h);
                     
        return density * fade;
    }

    // 多普勒效應 (Doppler Beaming)
    // lightDir: 光線方向
    // pos: 採樣點位置
    float getDopplerFactor(vec3 lightDir, vec3 pos) {
        // 吸積盤物質旋轉速度向量 (逆時針 Counter-Clockwise)
        // 在 disk 平面上，切線方向為 (z, 0, -x)
        vec3 vel = normalize(vec3(pos.z, 0.0, -pos.x));
        
        // 計算視線與速度的點積
        // lightDir 是從攝像機發出的，所以 lightDir 指向物體。
        // 一般 Doppler 與 dot(vel, viewDir) 有關，這裡 viewDir = -lightDir
        // 但為了簡化，直接用 dot(vel, lightDir) 判斷同向或反向
        
        float vDotL = dot(vel, normalize(lightDir));
        
        // 如果物質朝向觀察者運動 (vDotL < 0，因為 lightDir 指向物體)，則增亮
        // 這裡我們調整係數來達到視覺效果
        // 假設物質速度極快，接近光速
        
        // 簡單映射: 
        // 接近 (Approaching): 變亮, 藍移
        // 遠離 (Receding): 變暗, 紅移
        
        float factor = 1.0 - vDotL * 0.8; // 增強對比度
        return clamp(factor, 0.1, 3.0);
    }

    // 背景星空
    vec3 getStarfield(vec3 dir) {
        float n = noise(dir * 100.0);
        float stars = pow(max(0.0, n), 20.0) * 2.0;
        return vec3(stars);
    }

    void main() {
        // --- Clalculate Ray Direction (計算光線方向) ---
        // 標準化 UV (-1 到 1)
        vec2 uv = (vUv - 0.5) * 2.0;
        uv.x *= iResolution.x / iResolution.y;

        // 構建相機坐標系
        vec3 forward = normalize(cameraLookAt - cameraPos);
        vec3 right = normalize(cross(forward, vec3(0, 1, 0)));
        vec3 up = cross(right, forward);

        // 光線發射方向
        vec3 rayDir = normalize(forward + uv.x * right + uv.y * up);
        vec3 rayPos = cameraPos;
        bool hitHorizon = false; // 標記是否擊中事件視界

        vec3 accumColor = vec3(0.0); // 累積顏色
        float accumDensity = 0.0;    // 累積不透明度

        // --- Ray Marching Loop (光線步進循環) ---
        for (int i = 0; i < MAX_STEPS; i++) {
            float distToCenter = length(rayPos);
            
            // 1. Event Horizon Check (事件視界檢查)
            if (distToCenter < BH_RADIUS) {
                accumColor += vec3(0.0); // 黑色
                hitHorizon = true;
                break; // 光線被吸收
            }

            // 2. Gravity Bending (引力透鏡 - 光線彎曲)
            // 簡單牛頓近似: 力與距離平方成反比 (F ~ 1/r^2)
            // 我們修改光線方向，使其向中心彎曲
            // 為了性能和穩定性，這裡使用簡化的偏轉
            
            // 計算向心力向量
            vec3 toCenter = -normalize(rayPos);
            float force = BEND_STRENGTH / (distToCenter * distToCenter + 0.1);
            
            // 更新光線方向 (小步長彎曲)
            rayDir = normalize(rayDir + toCenter * force * STEP_SIZE);
            
            // 3. Render Accretion Disk (渲染吸積盤)
            float density = getAccretionDensity(rayPos);
            if (density > 0.01) {
                // 計算多普勒效應
                float doppler = getDopplerFactor(rayDir, rayPos);
                
                // 基礎顏色 (黑體輻射風格: 橙/金/白)
                vec3 baseColor = vec3(1.0, 0.6, 0.2) * density;
                
                // 應用多普勒色移
                // 接近: 更白/更亮
                // 遠離: 更紅/更暗
                if (doppler > 1.0) {
                     baseColor = mix(baseColor, vec3(0.8, 0.9, 1.0), (doppler - 1.0) * 0.5); // 藍移
                     baseColor *= doppler; // 增亮
                } else {
                     baseColor = mix(baseColor, vec3(0.5, 0.0, 0.0), (1.0 - doppler) * 2.0); // 紅移
                     baseColor *= doppler; // 變暗
                }

                // 體積光積累 (Volumetric Accumulation)
                float alpha = density * 0.2; // 透明度因子
                accumColor += baseColor * alpha * (1.0 - accumDensity);
                accumDensity += alpha;
                
                // 如果已經很不透明了，提前結束
                if (accumDensity > 0.95) break; 
            }

            // 更新位置
            // 動態步長：靠近黑洞與吸積盤時的步長
            float stepScale = max(0.02, distToCenter * 0.08); 
            rayPos += rayDir * STEP_SIZE * stepScale * 5.0;
            
            // 遠離場景則退出
            if (distToCenter > 20.0) break;
        }

        // --- Background (背景) ---
        // 只有未擊中事件視界時才渲染背景星空
        if (!hitHorizon) {
            vec3 bg = getStarfield(rayDir);
            accumColor += bg * (1.0 - accumDensity);
        }
        
        gl_FragColor = vec4(accumColor, 1.0);
    }
`;

// --- Scene Objects ---

// Full-screen Quad
const geometry = new THREE.PlaneGeometry(2, 2);
const uniformData = {
    iTime: { value: 0 },
    iResolution: { value: new THREE.Vector2(window.innerWidth, window.innerHeight) },
    cameraPos: { value: camera.position },
    cameraLookAt: { value: new THREE.Vector3(0, 0, 0) } // Assuming looking at origin
};

const material = new THREE.ShaderMaterial({
    vertexShader: vertexShader,
    fragmentShader: fragmentShader,
    uniforms: uniformData
});

const mesh = new THREE.Mesh(geometry, material);
mesh.frustumCulled = false; // Prevent culling since we manipulate vertex positions
scene.add(mesh);

// --- Post-Processing ---
const composer = new EffectComposer(renderer);
const renderPass = new RenderPass(scene, camera);
composer.addPass(renderPass);

const bloomPass = new UnrealBloomPass(
    new THREE.Vector2(window.innerWidth, window.innerHeight),
    CONFIG.bloomStrength,
    CONFIG.bloomRadius,
    CONFIG.bloomThreshold
);
composer.addPass(bloomPass);

// --- Animation Loop ---
const clock = new THREE.Clock();

function animate() {
    requestAnimationFrame(animate);

    const time = clock.getElapsedTime();

    // Update Uniforms
    uniformData.iTime.value = time;
    uniformData.cameraPos.value.copy(camera.position);

    // Update Controls
    controls.update();

    // Get the point the camera is looking at (OrbitControls target)
    uniformData.cameraLookAt.value.copy(controls.target);

    // Render
    composer.render();
}

// --- Resize Handler ---
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();

    renderer.setSize(window.innerWidth, window.innerHeight);
    composer.setSize(window.innerWidth, window.innerHeight);

    uniformData.iResolution.value.set(window.innerWidth, window.innerHeight);
});

// Start
animate();
