"""fsaverage5 정점과 Destrieux surface atlas ROI를 매핑한다."""

from __future__ import annotations

import json
from pathlib import Path

import numpy as np
from nilearn import datasets, surface

BASE = Path(__file__).resolve().parent.parent
OUTPUT_DIR = BASE / "analysis" / "roi"
NPZ_PATH = OUTPUT_DIR / "fsaverage5_destrieux_mapping.npz"
MANIFEST_PATH = OUTPUT_DIR / "fsaverage5_destrieux_mapping.manifest.json"


def load_vector(value: object) -> np.ndarray:
    if isinstance(value, (str, Path)):
        return np.asarray(surface.load_surf_data(str(value)), dtype=np.int32)
    return np.asarray(value, dtype=np.int32)


def decode_label(value: object) -> str:
    if isinstance(value, bytes):
        return value.decode("utf-8")
    return str(value)


def main() -> None:
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

    atlas = datasets.fetch_atlas_surf_destrieux()
    left_ids = load_vector(getattr(atlas, "map_left", atlas["map_left"]))
    right_ids = load_vector(getattr(atlas, "map_right", atlas["map_right"]))
    roi_names = np.asarray(
        [decode_label(label).strip() for label in getattr(atlas, "labels", atlas["labels"])],
        dtype=object,
    )

    np.savez_compressed(
        NPZ_PATH,
        atlas_name=np.asarray(["destrieux"], dtype=object),
        left_roi_ids=left_ids,
        right_roi_ids=right_ids,
        roi_names=roi_names,
    )

    manifest = {
        "atlas_name": "destrieux",
        "vertex_count_per_hemisphere": int(left_ids.shape[0]),
        "vertex_count_total": int(left_ids.shape[0] + right_ids.shape[0]),
        "roi_count": int(len(roi_names)),
        "left_unique_roi_count": int(np.unique(left_ids).shape[0]),
        "right_unique_roi_count": int(np.unique(right_ids).shape[0]),
        "roi_names": [
            {
                "roi_id": int(idx),
                "roi_name": str(name),
            }
            for idx, name in enumerate(roi_names)
        ],
    }
    MANIFEST_PATH.write_text(json.dumps(manifest, ensure_ascii=False, indent=2), encoding="utf-8")

    print(f"wrote {NPZ_PATH.relative_to(BASE)}")
    print(f"wrote {MANIFEST_PATH.relative_to(BASE)}")


if __name__ == "__main__":
    main()
