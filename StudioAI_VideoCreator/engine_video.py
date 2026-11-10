import os
from PIL import Image
import numpy as np

# Supporto nativo sia per MoviePy 1.x che MoviePy 2.x
try:
    from moviepy import VideoClip, AudioFileClip, VideoFileClip, concatenate_videoclips
except ImportError:
    from moviepy.editor import VideoClip, AudioFileClip, VideoFileClip, concatenate_videoclips

class VideoEngine:
    @staticmethod
    def create_clip(image_path: str, audio_path: str, output_clip_path: str, max_duration: float = 15.0, motion_type: str = "zoom_in") -> bool:
        os.makedirs(os.path.dirname(output_clip_path), exist_ok=True)
        try:
            actual_duration = float(max_duration)
            audio_clip = None
            
            if audio_path and os.path.exists(audio_path) and os.path.getsize(audio_path) > 300:
                audio_clip = AudioFileClip(audio_path)
                actual_duration = max(3.5, min(float(max_duration), audio_clip.duration + 0.8))

            base_img = Image.open(image_path).convert("RGB")
            orig_w, orig_h = base_img.size

            def make_frame(t):
                progress = t / actual_duration
                if motion_type == "zoom_in":
                    scale = 1.0 + (0.08 * progress)
                else:
                    scale = 1.08 - (0.08 * progress)
                
                new_w, new_h = int(orig_w * scale), int(orig_h * scale)
                frame_img = base_img.resize((new_w, new_h), Image.Resampling.BILINEAR)
                left = (new_w - orig_w) // 2
                top = (new_h - orig_h) // 2
                cropped = frame_img.crop((left, top, left + orig_w, top + orig_h))
                return np.array(cropped)

            clip = VideoClip(make_frame)
            if hasattr(clip, "with_duration"):
                clip = clip.with_duration(actual_duration)
            else:
                clip = clip.set_duration(actual_duration)

            if audio_clip:
                if hasattr(clip, "with_audio"):
                    clip = clip.with_audio(audio_clip)
                else:
                    clip = clip.set_audio(audio_clip)

            clip.write_videofile(
                output_clip_path,
                fps=24,
                codec="libx264",
                audio_codec="aac",
                preset="fast",
                threads=4,
                logger=None
            )
            clip.close()
            if audio_clip:
                audio_clip.close()
            return True
        except Exception as e:
            print(f"[VideoEngine Error]: {e}")
            return False

    @staticmethod
    def concatenate_clips(clip_paths: list, final_output_path: str) -> bool:
        try:
            loaded = [VideoFileClip(p) for p in clip_paths if os.path.exists(p)]
            if not loaded:
                return False
            final = concatenate_videoclips(loaded, method="compose")
            final.write_videofile(
                final_output_path,
                fps=24,
                codec="libx264",
                audio_codec="aac",
                preset="fast",
                threads=4,
                logger=None
            )
            for c in loaded:
                c.close()
            final.close()
            return True
        except Exception as e:
            print(f"[Concat Error]: {e}")
            return False