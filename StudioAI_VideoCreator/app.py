import streamlit as st
import os
from engine_script import parse_and_split_script
from engine_image import ImageEngine
from engine_audio import AudioEngine, VOICE_PROFILES
from engine_video import VideoEngine

st.set_page_config(page_title="StudioAI VideoCreator", layout="wide", page_icon="🎬")

st.markdown("""
<style>
    .main-title { font-size: 28px; font-weight: 800; color: #1E293B; margin-bottom: 2px; }
    .subtitle { font-size: 15px; color: #475569; margin-bottom: 20px; }
    .stButton>button { width: 100%; border-radius: 6px; font-weight: bold; }
</style>
""", unsafe_allow_html=True)

st.markdown('<div class="main-title">🎬 StudioAI VideoCreator — Studio di Animazione & Cinema</div>', unsafe_allow_html=True)
st.markdown('<div class="subtitle">Creazione automatica da copione con dialoghi, immagini Flux e voci neurali (10s o 15s)</div>', unsafe_allow_html=True)

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
PROJECTS_DIR = os.path.join(BASE_DIR, "output_progetti")
os.makedirs(PROJECTS_DIR, exist_ok=True)

st.sidebar.header("⚙️ Configurazione Video")
style_choice = st.sidebar.selectbox("Stile Artistico:", ["3D Pixar Cartoon", "Cinematografico Film"])
style_key = "pixar" if "Pixar" in style_choice else "cinematic"

aspect_choice = st.sidebar.selectbox("Formato Video:", ["9:16 Verticale (Shorts / Reels / TikTok)", "16:9 Orizzontale (YouTube Standard / Cinema)"])
w, h = (768, 1344) if "9:16" in aspect_choice else (1344, 768)

clip_max_dur = st.sidebar.select_slider("Durata Massima per Singola Clip:", options=[10, 15], value=15)

tabs = st.tabs(["📝 1. Copione & Dialoghi", "🎨 2. Generazione Asset", "🎬 3. Video Studio & Montaggio"])

with tabs[0]:
    st.subheader("Carica o Incolla qualsiasi Copione / Testo")
    up_file = st.file_uploader("Carica file .txt con copione", type=["txt"])
    file_content = ""
    if up_file:
        file_content = up_file.read().decode("utf-8")
        
    copione_txt = st.text_area("Oppure incolla qui il tuo copione:", value=file_content, height=220, placeholder="Incolla qui qualsiasi copione, testo con dialoghi o tabella di scene...")
    
    if st.button("✂️ Analizza Copione, Riconosci Dialoghi e Suddividi Scene"):
        if copione_txt.strip():
            scenes = parse_and_split_script(copione_txt, max_clip_duration=clip_max_dur)
            st.session_state["scenes"] = scenes
            st.success(f"Analisi riuscita! Trovate {len(scenes)} scene. Dialoghi ed azioni estratti con successo.")
        else:
            st.error("Inserisci o carica prima un copione di testo.")

    if "scenes" in st.session_state and st.session_state["scenes"]:
        st.write(f"### Scene & Dialoghi Riconosciuti ({len(st.session_state['scenes'])})")
        for sc in st.session_state["scenes"]:
            with st.expander(f"Scena {sc['index']}: {sc['title']}"):
                col_a, col_b = st.columns([2, 1])
                with col_a:
                    sc['prompt'] = st.text_area(f"Descrizione Scena Visiva {sc['index']}", value=sc['prompt'], key=f"p_{sc['index']}")
                with col_b:
                    st.write("**Dialoghi identificati:**")
                    updated_turns = []
                    for s_idx, (speaker, speech) in enumerate(sc["dialogue_turns"]):
                        spk = st.text_input(f"Personaggio #{s_idx+1}", value=speaker, key=f"spk_{sc['index']}_{s_idx}")
                        dlg = st.text_input(f"Battuta #{s_idx+1}", value=speech, key=f"dlg_{sc['index']}_{s_idx}")
                        updated_turns.append((spk, dlg))
                    sc["dialogue_turns"] = updated_turns

with tabs[1]:
    st.subheader("Generazione Gratuita Immagini & Doppiaggio Dialoghi")
    if "scenes" not in st.session_state or not st.session_state["scenes"]:
        st.info("Vai al Tab 1, inserisci il tuo copione e clicca su 'Analizza Copione'.")
    else:
        proj_name = st.text_input("Nome Cartella Progetto:", value="Mio_Progetto_Video")
        current_proj_dir = os.path.join(PROJECTS_DIR, proj_name)
        os.makedirs(current_proj_dir, exist_ok=True)
        st.session_state["current_proj_dir"] = current_proj_dir
        
        c1, c2 = st.columns(2)
        with c1:
            if st.button("🖼️ Genera Tutte le Immagini (Flux Gratuito)"):
                p_bar = st.progress(0)
                st_txt = st.empty()
                for i, sc in enumerate(st.session_state["scenes"]):
                    st_txt.text(f"Generazione Immagine Scena {sc['index']} ({style_choice})...")
                    img_f = os.path.join(current_proj_dir, f"scena_{sc['index']}.png")
                    ImageEngine.generate_image(sc['prompt'], img_f, style=style_key, width=w, height=h)
                    p_bar.progress((i + 1) / len(st.session_state["scenes"]))
                st_txt.success("Tutte le immagini sono pronte!")
                
        with c2:
            if st.button("🎙️ Genera Tutto il Doppiaggio (Multi-Voce Neurale)"):
                p_bar_a = st.progress(0)
                st_txt_a = st.empty()
                for i, sc in enumerate(st.session_state["scenes"]):
                    st_txt_a.text(f"Doppiaggio dialoghi Scena {sc['index']}...")
                    aud_f = os.path.join(current_proj_dir, f"audio_{sc['index']}.mp3")
                    AudioEngine.generate_dialogues_sequence(sc["dialogue_turns"], aud_f)
                    p_bar_a.progress((i + 1) / len(st.session_state["scenes"]))
                st_txt_a.success("Tutto il doppiaggio completato con successo!")

        st.divider()
        st.write("### Anteprima Asset Creati")
        grid = st.columns(3)
        for idx, sc in enumerate(st.session_state["scenes"]):
            col = grid[idx % 3]
            img_f = os.path.join(current_proj_dir, f"scena_{sc['index']}.png")
            aud_f = os.path.join(current_proj_dir, f"audio_{sc['index']}.mp3")
            with col:
                st.caption(f"Scena {sc['index']}: {sc['title']}")
                if os.path.exists(img_f):
                    st.image(img_f, use_container_width=True)
                if os.path.exists(aud_f):
                    st.audio(aud_f)

with tabs[2]:
    st.subheader("Animazione Dinamica & Montaggio Video Finale")
    target_dir = st.session_state.get("current_proj_dir", os.path.join(PROJECTS_DIR, "Mio_Progetto_Video"))
    
    if st.button(f"🎬 Crea Tutte le Clip Video ({clip_max_dur}s) e Monta Video Completo"):
        if "scenes" in st.session_state and st.session_state["scenes"]:
            vid_bar = st.progress(0)
            txt_box = st.empty()
            clip_list = []
            
            for i, sc in enumerate(st.session_state["scenes"]):
                txt_box.text(f"Creazione video Scena {sc['index']} con audio sincronizzato...")
                img_f = os.path.join(target_dir, f"scena_{sc['index']}.png")
                aud_f = os.path.join(target_dir, f"audio_{sc['index']}.mp3")
                out_clip = os.path.join(target_dir, f"clip_{sc['index']}.mp4")
                
                if os.path.exists(img_f):
                    m_type = "zoom_in" if i % 2 == 0 else "zoom_out"
                    VideoEngine.create_clip(img_f, aud_f, out_clip, max_duration=float(clip_max_dur), motion_type=m_type)
                    clip_list.append(out_clip)
                vid_bar.progress((i + 1) / len(st.session_state["scenes"]))
                
            txt_box.success("Tutte le singole clip sono pronte!")
            st.info("Unione di tutte le clip per il video definitivo...")
            final_video_file = os.path.join(target_dir, "Video_Completo.mp4")
            if VideoEngine.concatenate_clips(clip_list, final_video_file):
                st.success("🎉 Video Completo montato ed esportato con successo!")
                st.video(final_video_file)
        else:
            st.warning("Nessuna scena caricata. Torna al Tab 1.")
