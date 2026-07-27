import * as THREE from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";

const config = window.MV_SITE || {};
const invalid = (value) => !value || value.includes("YOUR-") || value.includes("YOUR_");
const configureLinks = (selector, url) => document.querySelectorAll(selector).forEach((link) => { if (invalid(url)) { link.classList.add("is-disabled"); link.addEventListener("click", (event) => event.preventDefault()); } else { link.href=url; link.target="_blank"; link.rel="noopener noreferrer"; } });
configureLinks(".js-discord-link", config.discordInvite); configureLinks(".js-star-citizen-link", config.starCitizenOrganisation);
document.querySelector("[data-config-note]")?.remove(); document.querySelectorAll("[data-current-year]").forEach((element)=>element.textContent=new Date().getFullYear());

const header=document.querySelector("[data-header]"); const updateHeader=()=>header?.classList.toggle("is-scrolled",window.scrollY>24); updateHeader(); window.addEventListener("scroll",updateHeader,{passive:true});
const menuToggle=document.querySelector("[data-menu-toggle]"), nav=document.querySelector("[data-nav]"); const closeMenu=()=>{menuToggle?.setAttribute("aria-expanded","false");nav?.classList.remove("is-open")};
menuToggle?.addEventListener("click",()=>{const open=menuToggle.getAttribute("aria-expanded")==="true";menuToggle.setAttribute("aria-expanded",String(!open));nav?.classList.toggle("is-open",!open)}); nav?.querySelectorAll("a").forEach((link)=>link.addEventListener("click",closeMenu));

const soundtrack=document.querySelector("[data-soundtrack]"), soundButton=document.querySelector("[data-sound-toggle]"), soundLabel=document.querySelector("[data-sound-label]"); let autoplayBlocked=false;
const updateSound=()=>{if(!soundtrack||!soundButton||!soundLabel)return; const muted=soundtrack.muted, blocked=soundtrack.paused&&autoplayBlocked; soundButton.classList.toggle("is-muted",muted);soundButton.classList.toggle("is-blocked",blocked);soundButton.setAttribute("aria-pressed",String(muted));soundLabel.textContent=blocked?"Play music":muted?"Unmute":"Mute";soundButton.setAttribute("aria-label",blocked?"Play soundtrack":muted?"Unmute soundtrack":"Mute soundtrack")};
const play=async()=>{if(!soundtrack)return false;try{await soundtrack.play();autoplayBlocked=false;updateSound();return true}catch(error){autoplayBlocked=true;updateSound();return false}};
if(soundtrack&&soundButton){soundtrack.volume=.28;soundtrack.muted=localStorage.getItem("mv-sc-muted")==="true";updateSound();play();const unlock=async(event)=>{if(event?.target?.closest?.("[data-sound-toggle]"))return;if(soundtrack.paused)await play();document.removeEventListener("pointerdown",unlock);document.removeEventListener("keydown",unlock)};document.addEventListener("pointerdown",unlock);document.addEventListener("keydown",unlock);soundButton.addEventListener("click",async(event)=>{event.stopPropagation();if(soundtrack.paused){soundtrack.muted=false;localStorage.setItem("mv-sc-muted","false");await play()}else{soundtrack.muted=!soundtrack.muted;localStorage.setItem("mv-sc-muted",String(soundtrack.muted));updateSound()}});soundtrack.addEventListener("play",updateSound);soundtrack.addEventListener("pause",updateSound);soundtrack.addEventListener("volumechange",updateSound)}

const viewer=document.querySelector("[data-ship-viewer]");
if(viewer){
  const canvas=viewer.querySelector("[data-model-canvas]"), status=viewer.querySelector("[data-model-status]"), modelUrl=viewer.dataset.modelUrl;
  const fail=(message)=>{if(status){status.classList.add("is-error");status.textContent=message}};
  try{
    const renderer=new THREE.WebGLRenderer({canvas,antialias:true,alpha:true,powerPreference:"high-performance"});renderer.setPixelRatio(Math.min(window.devicePixelRatio||1,2));renderer.setClearColor(0x000000,0);renderer.outputColorSpace=THREE.SRGBColorSpace;
    const scene=new THREE.Scene(), camera=new THREE.PerspectiveCamera(35,1,.01,100);
    camera.position.set(0,1.05,5.8);
    camera.lookAt(0,0,0);
    const shipGroup=new THREE.Group();shipGroup.rotation.x=-.12;scene.add(shipGroup);scene.add(new THREE.HemisphereLight(0xdaf8ff,0x071017,1.8));
    const key=new THREE.DirectionalLight(0xe9fbff,3.2);key.position.set(4,5,5);scene.add(key);const rim=new THREE.DirectionalLight(0x3fb8db,2.6);rim.position.set(-4,2,-4);scene.add(rim);const fill=new THREE.PointLight(0x6ed8ef,18,14);fill.position.set(0,-2,3);scene.add(fill);
    let dragging=false,previousX=0,velocity=0,modelLoaded=false;const timeout=window.setTimeout(()=>{if(!modelLoaded)fail("The Super Hornet model is taking too long to load. Refresh the page to try again.")},20000);
    new GLTFLoader().load(modelUrl,(gltf)=>{
      window.clearTimeout(timeout);
      modelLoaded=true;

      const model=gltf.scene;
      const unscaledBox=new THREE.Box3().setFromObject(model);
      const unscaledSize=unscaledBox.getSize(new THREE.Vector3());
      const largest=Math.max(unscaledSize.x,unscaledSize.y,unscaledSize.z)||1;
      const scale=3.7/largest;

      model.scale.setScalar(scale);
      model.updateMatrixWorld(true);

      // Centre after scaling. Doing this before scaling can leave a converted
      // model visibly offset even though its geometry loaded correctly.
      const scaledBox=new THREE.Box3().setFromObject(model);
      const scaledCentre=scaledBox.getCenter(new THREE.Vector3());
      model.position.sub(scaledCentre);

      model.traverse((child)=>{
        if(child.isMesh){
          child.material=new THREE.MeshStandardMaterial({
            color:0xb8cbd3,
            metalness:.72,
            roughness:.3,
            side:THREE.DoubleSide
          });
          child.castShadow=false;
          child.receiveShadow=false;
        }
      });

      shipGroup.add(model);
      shipGroup.rotation.set(-.08,.34,0);
      camera.lookAt(0,0,0);
      status?.remove();
    },undefined,(error)=>{
      window.clearTimeout(timeout);
      console.error(error);
      fail("The Super Hornet model could not be loaded in this browser.");
    });
    const resize=()=>{const width=viewer.clientWidth,height=viewer.clientHeight;renderer.setSize(width,height,false);camera.aspect=width/Math.max(height,1);camera.updateProjectionMatrix()};resize();window.addEventListener("resize",resize);if("ResizeObserver" in window)new ResizeObserver(resize).observe(viewer);
    viewer.addEventListener("pointerdown",(event)=>{dragging=true;previousX=event.clientX;velocity=0;viewer.setPointerCapture?.(event.pointerId)});viewer.addEventListener("pointermove",(event)=>{if(!dragging)return;const delta=event.clientX-previousX;previousX=event.clientX;shipGroup.rotation.y+=delta*.008;velocity=delta*.0018});["pointerup","pointercancel","pointerleave"].forEach(type=>viewer.addEventListener(type,()=>dragging=false));
    let visible=true;if("IntersectionObserver" in window)new IntersectionObserver(entries=>visible=entries[0]?.isIntersecting??true,{threshold:.02}).observe(viewer);const clock=new THREE.Clock();const animate=()=>{requestAnimationFrame(animate);const delta=Math.min(clock.getDelta(),.04);if(visible){if(!dragging){shipGroup.rotation.y+=.16*delta+velocity;velocity*=.94}renderer.render(scene,camera)}};animate();
  }catch(error){console.error(error);fail("The 3D viewer could not start in this browser.")}
}

const reveals=document.querySelectorAll(".reveal");if(!("IntersectionObserver" in window))reveals.forEach(el=>el.classList.add("is-visible"));else{const observer=new IntersectionObserver(entries=>entries.forEach(entry=>{if(entry.isIntersecting){entry.target.classList.add("is-visible");observer.unobserve(entry.target)}}),{threshold:.12});reveals.forEach(el=>observer.observe(el))}
