import os
import re
import csv
import shutil
from pathlib import Path

# --- CONFIGURATION ---
SOURCE_DIR = "/Users/killywilly/Desktop/Fine line tattoo designs/"
# Point to the unified data directory in the project root
PROJ_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), "../../"))
OUTPUT_CSV = os.path.join(PROJ_ROOT, "data/seo_metadata.csv")
MANUAL_DIR = os.path.join(SOURCE_DIR, "manual_review")
DRY_RUN = False 

# KEYWORD MAPPING
CATEGORY_MAP = {
    "1": "minimalist-buds", "15": "minimalist-buds", "20": "minimalist-buds",
    "2": "floral-composition", "10": "floral-composition", "12": "floral-composition",
    "3": "wildflower-illustration", "9": "wildflower-illustration", "11": "wildflower-illustration",
    "4": "botanical-leaves", "7": "botanical-leaves", "18": "botanical-leaves",
    "5": "delicate-branches", "14": "delicate-branches", "19": "delicate-branches",
    "6": "elegant-botanical", "13": "elegant-botanical", "17": "elegant-botanical",
    "8": "minimalist-stem", "21": "minimalist-stem", "25": "minimalist-stem",
    "16": "elegant-stems",
}

REVERSE_MAP = {
    "minimalist-buds": "1",
    "floral-composition": "2",
    "wildflower-illustration": "3",
    "botanical-leaves": "4",
    "delicate-branches": "5",
    "elegant-botanical": "6",
    "minimalist-stem": "8",
    "elegant-stems": "16"
}

# REGEX PATTERNS
PATTERN_ORIGINAL = re.compile(r"design_(\d+)(?:\s*\((\d+)\)|.*)?\.png", re.IGNORECASE)
PATTERN_BAD_RENAME = re.compile(r"fine-line-([\w-]+)-(\d+)\.png", re.IGNORECASE)

def get_seo_name(family, index):
    category = CATEGORY_MAP.get(family)
    if not category: return None
    idx_str = str(index).zfill(3) if index else "000"
    return f"fine-line-{category}-f{family}-{idx_str}.png"

def run_automation():
    if not os.path.exists(SOURCE_DIR): return
    if not os.path.exists(MANUAL_DIR): os.makedirs(MANUAL_DIR)

    # 1. Gather all files including from manual_review to centralize
    all_files = []
    for root, dirs, files in os.walk(SOURCE_DIR):
        for f in files:
            if f.lower().endswith(".png"):
                all_files.append(os.path.join(root, f))

    metadata = []
    
    print(f"Final Cleanup on {len(all_files)} files...")

    for file_path in sorted(all_files):
        filename = os.path.basename(file_path)
        new_name = None
        
        # Scenario A: Original design_X
        match = PATTERN_ORIGINAL.match(filename)
        if match:
            family_num = match.group(1)
            sub_index = match.group(2)
            new_name = get_seo_name(family_num, sub_index)
            if not new_name:
                # Still unmapped, move to manual if not there
                if "manual_review" not in file_path:
                    print(f"[MANUAL] {filename} -> Moving to manual_review/")
                    if not DRY_RUN: shutil.move(file_path, os.path.join(MANUAL_DIR, filename))
                continue

        # Scenario B: Previous "bad" rename (no -f)
        elif PATTERN_BAD_RENAME.match(filename) and "-f" not in filename:
            match = PATTERN_BAD_RENAME.match(filename)
            category = match.group(1)
            index = match.group(2)
            family = REVERSE_MAP.get(category)
            if family:
                new_name = f"fine-line-{category}-f{family}-{index}.png"

        if new_name:
            dst_path = os.path.join(SOURCE_DIR, new_name)
            
            if new_name == filename:
                # Already correct, but verify it's in the root
                if file_path != dst_path:
                    print(f"[MOVE] {filename} -> Root")
                    if not DRY_RUN: shutil.move(file_path, dst_path)
            else:
                if os.path.exists(dst_path):
                    # Duplicate found (e.g. design_X(Y) and fine-line-X-Y.png are the same)
                    print(f"[DUP] Removing duplicate: {filename}")
                    if not DRY_RUN: os.remove(file_path)
                else:
                    print(f"[RENAME] {filename} -> {new_name}")
                    if not DRY_RUN: os.rename(file_path, dst_path)
            
            # Record for metadata if it's now correct
            category = new_name.split("fine-line-")[1].split("-f")[0]
            alt_text = f"Fine line {category.replace('-', ' ')} tattoo design"
            metadata.append({"new_filename": new_name, "suggested_alt_text": alt_text})

    # Final Meta Generation
    if metadata and not DRY_RUN:
        # Sort and remove duplicates from list
        unique_meta = {m['new_filename']: m for m in metadata}.values()
        with open(OUTPUT_CSV, "w", newline="") as f:
            writer = csv.DictWriter(f, fieldnames=["new_filename", "suggested_alt_text"])
            writer.writeheader()
            writer.writerows(sorted(unique_meta, key=lambda x: x['new_filename']))
        print(f"\nFinal Metadata exported to: {OUTPUT_CSV}")

if __name__ == "__main__":
    run_automation()
