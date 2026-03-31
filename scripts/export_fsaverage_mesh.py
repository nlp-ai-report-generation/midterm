"""fsaverage5 cortical mesh를 GLB로 내보낸다."""

from __future__ import annotations

from pathlib import Path

import numpy as np
import trimesh
from nilearn import datasets, surface

BASE = Path(__file__).resolve().parent.parent
OUTPUT_PATH = BASE / "frontend" / "public" / "data" / "simulations" / "brain-mesh.glb"


def build_scene() -> trimesh.Scene:
    fsaverage = datasets.fetch_surf_fsaverage(mesh="fsaverage5")
    scene = trimesh.Scene()

    for hemisphere, surf_path in (
        ("left", fsaverage.pial_left),
        ("right", fsaverage.pial_right),
    ):
        coords, faces = surface.load_surf_mesh(surf_path)
        colors = np.tile(np.array([[235, 240, 245, 255]], dtype=np.uint8), (coords.shape[0], 1))
        mesh = trimesh.Trimesh(
            vertices=coords,
            faces=faces,
            vertex_colors=colors,
            process=False,
        )
        scene.add_geometry(
            mesh,
            node_name=f"{hemisphere}_hemisphere",
            geom_name=f"{hemisphere}_hemisphere",
        )

    return scene


def main() -> None:
    OUTPUT_PATH.parent.mkdir(parents=True, exist_ok=True)
    scene = build_scene()
    scene.export(OUTPUT_PATH)
    print(f"wrote {OUTPUT_PATH} ({OUTPUT_PATH.stat().st_size:,} bytes)")


if __name__ == "__main__":
    main()
