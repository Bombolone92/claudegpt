import re

def parse_and_split_script(script_text: str, max_clip_duration: int = 15):
    """
    Analizza qualsiasi copione, individua i dialoghi multi-personaggio,
    pulisce la descrizione per la generazione visiva e imposta i limiti di 10 o 15 secondi.
    """
    scenes = []
    lines = [l.strip() for l in script_text.splitlines() if l.strip()]
    current_index = 1
    
    # Regex pulita per dialoghi senza conflitti di virgolette
    diag_re = re.compile(r'([A-Za-zÀ-ÿ0-9_\s]{2,20})\s*:\s*["“\']?([^"“\'\n\r]+)["”\']?')
    
    for line in lines:
        match = re.match(r"^(?:(?:Scena|N[°o]?)\s*)?(\d+)[\.\-\:\s]+(.*?)(?:\s{2,}|\t|\:\s)(.*)$", line, re.IGNORECASE)
        if match:
            title = match.group(2).strip()
            content = match.group(3).strip()
        else:
            title = f"Scena {current_index}"
            content = line

        found_dialogues = diag_re.findall(content)
        dialogue_turns = []
        visual_prompt = content
        
        if found_dialogues:
            for speaker, text in found_dialogues:
                cleaned_text = text.strip()
                if cleaned_text:
                    dialogue_turns.append((speaker.strip(), cleaned_text))
            visual_prompt = diag_re.sub("", content).strip()
            visual_prompt = re.sub(r'["“].*?["”]', "", visual_prompt).strip()
        else:
            quotes = re.findall(r'["“](.*?)["”]', content)
            if quotes:
                dialogue_turns.append(("Narratore", " ".join(quotes)))
                visual_prompt = re.sub(r'["“].*?["”]', "", content).strip()
            else:
                dialogue_turns.append(("Narratore", content))
                visual_prompt = content

        if not visual_prompt or len(visual_prompt) < 5:
            visual_prompt = title if len(title) > 5 else content

        scenes.append({
            "index": current_index,
            "title": title,
            "prompt": visual_prompt,
            "dialogue_turns": dialogue_turns,
            "duration": float(max_clip_duration)
        })
        current_index += 1

    return scenes