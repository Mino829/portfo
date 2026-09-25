export const categories = [
  { id: "all", label: "ALL", route: "#/works" },
  { id: "app", label: "APPS", route: "#/apps" },
  { id: "design", label: "DESIGN", route: "#/design" },
];

export const works = [
  {
    "id": "01",
    "slug": "portfolio-site",
    "title": "Portfolio Site ",
    "category": "app",
    "type": "CASE STUDY",
    "stack": [
      "React",
      "Vite",
      "Figma",
      "Content Design"
    ],
    "summary": "就活用のポートフォリオを、作品主役の情報設計と強いアートディレクションで構成。",
    "role": "Design direction, frontend implementation, content structure",
    "year": "2026",
    "status": "In progress",
    "links": {
      "demo": "",
      "github": "https://github.com/Mino829/portfo",
      "figma": "https://www.figma.com/design/NsCDLli3aVdxVDIqV33EXZ"
    },
    "thumbnail": "",
    "images": [],
    "points": [
      "Works Firstの構成で、プロフィールより制作物を先に見せる。",
      "Notionで作品情報を管理できるよう、データ層を分離。",
      "PC/モバイル両方で編集的なタイポグリッドを維持。"
    ]
  },
  {
    "id": "02",
    "slug": "quad-reprojection",
    "title": "Quad Reprojection",
    "category": "design",
    "type": "CASE STUDY",
    "stack": [
      "TouchDesigner",
      "MediaPipe",
      "Python"
    ],
    "summary": "MediaPipeの解析結果をTouchDesignerへ送り、四隅を固定した再投影で立体感をつくるインタラクティブ展示。",
    "role": "インタラクション設計、TouchDesigner実装、展示",
    "year": "2026",
    "status": "Published",
    "links": {
      "demo": "https://www.instagram.com/reel/DXCKRIPgYBC/",
      "github": "",
      "figma": ""
    },
    "thumbnail": "/images/works/quad-reprojection.jpg",
    "images": [],
    "points": [
      "MediaPipeの解析結果をOSCでTouchDesignerへ連携。",
      "Quad Reprojectionで投影面の四隅を固定し、立体感を設計。",
      "処理を2台のPCに分け、展示時の描画負荷に対応。"
    ]
  },
  {
    "id": "03",
    "slug": "key-visual",
    "title": "NEWTONE 春ライブ | Key Visual",
    "category": "design",
    "type": "CASE STUDY",
    "stack": [
      "Illustrator",
      "Photoshop",
      "Blender"
    ],
    "summary": "芝浦工業大学アカペラサークルNEWTONEの春ライブで、キービジュアルとパンフレットを制作。ビジュアルのディレクションからデザインまで担当した。",
    "role": "キービジュアルのディレクション・デザイン、パンフレットデザイン",
    "year": "2026",
    "status": "Published",
    "links": {
      "demo": "https://www.instagram.com/p/DV_Mc0igTMf/",
      "github": "",
      "figma": ""
    },
    "thumbnail": "/images/works/newtone-key-visual.jpeg",
    "images": [
      "/images/works/newtone-pamphlet.jpg"
    ],
    "points": [
      "春ライブのキービジュアルをディレクションから制作まで担当。",
      "Illustrator、Photoshop、Blenderを用いてビジュアルを制作。",
      "同じイベントのパンフレットもデザイン。"
    ]
  },
  {
    "id": "04",
    "slug": "shibaurasai-2025",
    "title": "芝浦祭2025 | 入力はあなたです",
    "category": "design",
    "type": "CASE STUDY",
    "stack": [
      "TouchDesigner",
      "Blender",
      "Unreal Engine 5"
    ],
    "summary": "「入力はあなたです」をテーマにした個人展示。TouchDesignerでVJシステムを組み、学んだ表現を複数の作品として統合した。",
    "role": "企画、個人制作、VJシステム構築、展示",
    "year": "2025",
    "status": "Published",
    "links": {
      "demo": "https://www.instagram.com/p/DQ0nX_tEQ4K/",
      "github": "",
      "figma": ""
    },
    "thumbnail": "/images/works/shibaurasai-2025.jpg",
    "images": [
      "/images/works/shibalab-2025.jpg",
      "/images/works/shibaurasai-2025-1.png",
      "/images/works/shibaurasai-2025-4.png"
    ],
    "points": [
      "個人制作として芝浦祭2025に出展。",
      "TouchDesignerでVJシステムを構築し、作品ごとにコンポーネントを分けて統合。",
      "Blender、Unreal Engine 5も制作に使用。"
    ]
  },
  {
    "id": "05",
    "slug": "re-entrance",
    "title": "Re:entrance | 大宮祭2025",
    "category": "design",
    "type": "CASE STUDY",
    "stack": [
      "TouchDesigner",
      "OpenCV"
    ],
    "summary": "入場した自分の姿をアナログテレビへ再投影し、日常から少しずれた感覚をつくるインタラクティブ作品。",
    "role": "体験設計、TouchDesigner実装、展示",
    "year": "2025",
    "status": "Published",
    "links": {
      "demo": "https://www.instagram.com/reel/DVYid3ckVEq/",
      "github": "",
      "figma": ""
    },
    "thumbnail": "/images/works/re-entrance.jpeg",
    "images": [],
    "points": [
      "顔認識カメラとアナログテレビを用いた体験を構成。",
      "カメラの装飾で、来場者がのぞくきっかけを設計。",
      "TouchDesignerとOpenCVでインタラクティブな仕組みを構築。"
    ]
  }
];

export const credits = [
  ["ROLE", "Creative Technologist / Visual & Interactive Director"],
  ["STACK", "TouchDesigner, Unreal Engine 5, Blender, React, TypeScript, Go"],
  ["DESIGN", "3D CG, 映像, インタラクティブ表現, グラフィック"],
  ["METHOD", "企画, プロトタイピング, 実装, 展示"],
  ["VOICE", "視覚表現と技術実装を横断し、体験をかたちにする。"],
];
