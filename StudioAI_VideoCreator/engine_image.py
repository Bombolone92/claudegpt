import urllib.parse
import os
import time
import requests

class ImageEngine:
    @staticmethod
    def generate_image(prompt: str, output_path: str, style: str = "pixar", width: int = 768, height: int = 1344) -> bool:
        os.makedirs(os.path.dirname(output_path), exist_ok=True)
        if style == "pixar":
            full_prompt = (
                f"Pixar 3D animation style, expressive character design, warm natural volumetric lighting, "
                f"soft smooth shadows, rich vibrant colors, high detail 3D render, Disney animation aesthetic: {prompt}"
            )
        else:
            full_prompt = (
                f"Cinematic movie film still, 35mm photograph, masterclass cinematography, "
                f"anamorphic lens flare, shallow depth of field, dramatic cinematic lighting, "
                f"photorealistic 8k, atmospheric scene: {prompt}"
            )
            
        encoded = urllib.parse.quote(full_prompt)
        seed = int(time.time() * 1000) % 999999
        url = f"https://image.pollinations.ai/prompt/{encoded}?width={width}&height={height}&seed={seed}&model=flux&nologo=true"
        
        try:
            res = requests.get(url, timeout=90)
            if res.status_code == 200 and len(res.content) > 5000:
                with open(output_path, "wb") as f:
                    f.write(res.content)
                return True
        except Exception as e:
            print(f"[ImageEngine Error]: {e}")
            return False
