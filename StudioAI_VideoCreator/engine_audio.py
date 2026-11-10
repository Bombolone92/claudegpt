import asyncio
import os
import edge_tts

try:
    from moviepy import AudioFileClip, concatenate_audioclips
except ImportError:
    from moviepy.editor import AudioFileClip, concatenate_audioclips

VOICE_PROFILES = {
    "Narratore (Neutro)": {"voice": "it-IT-DiegoNeural", "rate": "+0%", "pitch": "+0Hz"},
    "Narratrice (Femminile)": {"voice": "it-IT-ElsaNeural", "rate": "+0%", "pitch": "+0Hz"},
    "Personaggio Giovane / Vivace": {"voice": "it-IT-IsabellaNeural", "rate": "+10%", "pitch": "+45Hz"},
    "Personaggio Maturo / Calmo": {"voice": "it-IT-GiuseppeNeural", "rate": "-4%", "pitch": "-15Hz"},
    "Personaggio Robusto / Profondo": {"voice": "it-IT-DiegoNeural", "rate": "-6%", "pitch": "-30Hz"},
}

class AudioEngine:
    @staticmethod
    def auto_detect_voice(character_name: str) -> str:
        name = character_name.strip().lower()
        if any(k in name for k in ["bambin", "piccol", "cucciol", "vivac", "ettore"]):
            return "Personaggio Giovane / Vivace"
        elif any(k in name for k in ["grande", "profond", "alano", "bruno", "guardia"]):
            return "Personaggio Robusto / Profondo"
        elif any(k in name for k in ["femmin", "ragazza", "mamma", "luna"]):
            return "Narratrice (Femminile)"
        elif any(k in name for k in ["saggio", "serio", "calmo", "rex", "baffi", "nonno"]):
            return "Personaggio Maturo / Calmo"
        return "Narratore (Neutro)"

    @staticmethod
    async def _synth_file(text: str, out_path: str, voice_profile_key: str):
        profile = VOICE_PROFILES.get(voice_profile_key, VOICE_PROFILES["Narratore (Neutro)"])
        communicate = edge_tts.Communicate(
            text=text,
            voice=profile["voice"],
            rate=profile["rate"],
            pitch=profile["pitch"]
        )
        await communicate.save(out_path)

    @staticmethod
    def generate_speech(text: str, out_path: str, voice_profile_key: str = "Narratore (Neutro)") -> bool:
        os.makedirs(os.path.dirname(out_path), exist_ok=True)
        if not text or not text.strip():
            return False
        try:
            asyncio.run(AudioEngine._synth_file(text.strip(), out_path, voice_profile_key))
            return os.path.exists(out_path) and os.path.getsize(out_path) > 300
        except Exception as e:
            print(f"[AudioEngine Error]: {e}")
            return False

    @staticmethod
    def generate_dialogues_sequence(dialogue_turns: list, final_out_path: str) -> bool:
        if not dialogue_turns:
            return False
        if len(dialogue_turns) == 1:
            char, line = dialogue_turns[0]
            v_profile = AudioEngine.auto_detect_voice(char)
            return AudioEngine.generate_speech(line, final_out_path, v_profile)
            
        temp_files = []
        base_dir = os.path.dirname(final_out_path)
        try:
            for idx, (char, line) in enumerate(dialogue_turns):
                t_path = os.path.join(base_dir, f"_temp_part_{idx}.mp3")
                v_profile = AudioEngine.auto_detect_voice(char)
                ok = AudioEngine.generate_speech(line, t_path, v_profile)
                if ok:
                    temp_files.append(t_path)
            
            if not temp_files:
                return False
                
            clips = [AudioFileClip(p) for p in temp_files]
            final_audio = concatenate_audioclips(clips)
            final_audio.write_audiofile(final_out_path, logger=None)
            
            for c in clips:
                c.close()
            final_audio.close()
            
            for p in temp_files:
                try:
                    os.remove(p)
                except:
                    pass
            return True
        except Exception as e:
            print(f"[Dialogue Synth Error]: {e}")
            return False