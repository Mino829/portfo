export const categories = [
  {
    "id": "all",
    "label": "ALL",
    "route": "/work"
  },
  {
    "id": "app",
    "label": "APPS",
    "route": "/work?category=app"
  },
  {
    "id": "design",
    "label": "DESIGN",
    "route": "/work?category=design"
  }
];

export const works = [
  {
    "id": "01",
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
    ],
    "featured": false,
    "body": [
      {
        "id": "451c5ade-eb4c-4c92-a444-1e464ef35e12",
        "type": "heading_2",
        "richText": [
          {
            "text": "概要",
            "href": null,
            "annotations": {
              "bold": false,
              "italic": false,
              "strikethrough": false,
              "underline": false,
              "code": false,
              "color": "default"
            }
          }
        ]
      },
      {
        "id": "c5e45ecb-cd0c-4094-a474-549958f8404a",
        "type": "paragraph",
        "richText": [
          {
            "text": "Quad Reprojectionは、MediaPipeとTouchDesignerを組み合わせたインタラクティブ展示作品。カメラで取得した解析結果をOSCで送り、投影面の四隅を固定する再投影によって立体感を生み出す。",
            "href": null,
            "annotations": {
              "bold": false,
              "italic": false,
              "strikethrough": false,
              "underline": false,
              "code": false,
              "color": "default"
            }
          }
        ]
      },
      {
        "id": "22f9fa2c-73dc-4252-b5e3-f550af656b03",
        "type": "heading_2",
        "richText": [
          {
            "text": "担当と実装",
            "href": null,
            "annotations": {
              "bold": false,
              "italic": false,
              "strikethrough": false,
              "underline": false,
              "code": false,
              "color": "default"
            }
          }
        ]
      },
      {
        "id": "3dbb0c5d-cbf8-491a-b33b-3a54c4ebb675",
        "type": "bulleted_list_item",
        "richText": [
          {
            "text": "TouchDesignerでメインシステムを構築。",
            "href": null,
            "annotations": {
              "bold": false,
              "italic": false,
              "strikethrough": false,
              "underline": false,
              "code": false,
              "color": "default"
            }
          }
        ]
      },
      {
        "id": "c8538a01-e9b0-41c2-9020-276da50af617",
        "type": "bulleted_list_item",
        "richText": [
          {
            "text": "MediaPipeの解析結果をPython側で調整し、OSCで連携。",
            "href": null,
            "annotations": {
              "bold": false,
              "italic": false,
              "strikethrough": false,
              "underline": false,
              "code": false,
              "color": "default"
            }
          }
        ]
      },
      {
        "id": "585f9dd0-ff12-4888-b697-340bdac6c3a3",
        "type": "bulleted_list_item",
        "richText": [
          {
            "text": "処理を2台のPCへ分け、展示時の描画負荷に対応。",
            "href": null,
            "annotations": {
              "bold": false,
              "italic": false,
              "strikethrough": false,
              "underline": false,
              "code": false,
              "color": "default"
            }
          }
        ]
      },
      {
        "id": "e86d5af4-6d33-41cd-99d1-587eb58545d2",
        "type": "heading_2",
        "richText": [
          {
            "text": "記録",
            "href": null,
            "annotations": {
              "bold": false,
              "italic": false,
              "strikethrough": false,
              "underline": false,
              "code": false,
              "color": "default"
            }
          }
        ]
      },
      {
        "id": "96adb817-ff1a-4b4f-8f7a-34e4418ac7df",
        "type": "paragraph",
        "richText": [
          {
            "text": "展示動画",
            "href": "https://www.instagram.com/reel/DXCKRIPgYBC/",
            "annotations": {
              "bold": false,
              "italic": false,
              "strikethrough": false,
              "underline": false,
              "code": false,
              "color": "default"
            }
          }
        ]
      },
      {
        "id": "18553e1b-4dcd-40b0-8072-00396b574570",
        "type": "paragraph",
        "richText": [
          {
            "text": "Untitled",
            "href": "https://app.notion.com/p/34a07820ded98092a0d8e4492b729173",
            "annotations": {
              "bold": false,
              "italic": false,
              "strikethrough": false,
              "underline": false,
              "code": false,
              "color": "default"
            }
          }
        ]
      }
    ]
  },
  {
    "id": "02",
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
    ],
    "featured": false,
    "body": [
      {
        "id": "03006aae-5032-4a48-b235-c98e81b5975c",
        "type": "heading_2",
        "richText": [
          {
            "text": "概要",
            "href": null,
            "annotations": {
              "bold": false,
              "italic": false,
              "strikethrough": false,
              "underline": false,
              "code": false,
              "color": "default"
            }
          }
        ]
      },
      {
        "id": "a54c83b9-f202-41ef-8bcd-1f7db50a40a9",
        "type": "paragraph",
        "richText": [
          {
            "text": "芝浦工業大学アカペラサークルNEWTONEの春ライブ（2026年3月4日）に向け、キービジュアルとパンフレットを制作した。",
            "href": null,
            "annotations": {
              "bold": false,
              "italic": false,
              "strikethrough": false,
              "underline": false,
              "code": false,
              "color": "default"
            }
          }
        ]
      },
      {
        "id": "fa679d4a-86c7-4709-ad33-3a643fc0731e",
        "type": "heading_2",
        "richText": [
          {
            "text": "担当",
            "href": null,
            "annotations": {
              "bold": false,
              "italic": false,
              "strikethrough": false,
              "underline": false,
              "code": false,
              "color": "default"
            }
          }
        ]
      },
      {
        "id": "06d36428-c8d9-4cd2-8c73-ae5f2c51adaa",
        "type": "bulleted_list_item",
        "richText": [
          {
            "text": "キービジュアルはディレクションからデザインまで担当。",
            "href": null,
            "annotations": {
              "bold": false,
              "italic": false,
              "strikethrough": false,
              "underline": false,
              "code": false,
              "color": "default"
            }
          }
        ]
      },
      {
        "id": "ca996da9-74a7-44b4-9ce6-e7b0b6da155c",
        "type": "bulleted_list_item",
        "richText": [
          {
            "text": "Illustrator、Photoshop、Blenderを使ってビジュアルを制作。",
            "href": null,
            "annotations": {
              "bold": false,
              "italic": false,
              "strikethrough": false,
              "underline": false,
              "code": false,
              "color": "default"
            }
          }
        ]
      },
      {
        "id": "8d0f5eb7-7db1-4014-9036-d8e6cc65b402",
        "type": "bulleted_list_item",
        "richText": [
          {
            "text": "同じライブのパンフレットもデザイン。",
            "href": null,
            "annotations": {
              "bold": false,
              "italic": false,
              "strikethrough": false,
              "underline": false,
              "code": false,
              "color": "default"
            }
          }
        ]
      },
      {
        "id": "bc9cdeb7-be14-4b80-8e7d-6e3a81dc0af1",
        "type": "heading_2",
        "richText": [
          {
            "text": "記録",
            "href": null,
            "annotations": {
              "bold": false,
              "italic": false,
              "strikethrough": false,
              "underline": false,
              "code": false,
              "color": "default"
            }
          }
        ]
      },
      {
        "id": "d9f33ee1-e632-4736-a4f3-7e7c61a03224",
        "type": "paragraph",
        "richText": [
          {
            "text": "キービジュアルの投稿",
            "href": "https://www.instagram.com/p/DV_Mc0igTMf/",
            "annotations": {
              "bold": false,
              "italic": false,
              "strikethrough": false,
              "underline": false,
              "code": false,
              "color": "default"
            }
          }
        ]
      },
      {
        "id": "6fb71ddc-ebaf-44ff-bb9e-7d6ec0e50bc2",
        "type": "paragraph",
        "richText": [
          {
            "text": "パンフレットの投稿",
            "href": "https://www.instagram.com/p/DV_OLNDmYsP/",
            "annotations": {
              "bold": false,
              "italic": false,
              "strikethrough": false,
              "underline": false,
              "code": false,
              "color": "default"
            }
          }
        ]
      },
      {
        "id": "c3e1ba3b-f768-40e3-bef4-2b2021851c7c",
        "type": "paragraph",
        "richText": [
          {
            "text": "キービジュアルの制作記録",
            "href": "https://app.notion.com/p/32607820ded9802889e4e6f70256e27e",
            "annotations": {
              "bold": false,
              "italic": false,
              "strikethrough": false,
              "underline": false,
              "code": false,
              "color": "default"
            }
          }
        ]
      },
      {
        "id": "a8d48390-0304-45b0-8db2-fac8f4e9f4c0",
        "type": "paragraph",
        "richText": [
          {
            "text": "パンフレットの制作記録",
            "href": "https://app.notion.com/p/32607820ded980f4af85fcfcd87624ac",
            "annotations": {
              "bold": false,
              "italic": false,
              "strikethrough": false,
              "underline": false,
              "code": false,
              "color": "default"
            }
          }
        ]
      }
    ]
  },
  {
    "id": "04",
    "slug": "portfolio-site",
    "title": "Portfolio Site",
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
    ],
    "featured": false,
    "body": []
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
    ],
    "featured": false,
    "body": [
      {
        "id": "b23981cc-7480-4435-8632-e709ba1314a5",
        "type": "heading_2",
        "richText": [
          {
            "text": "概要",
            "href": null,
            "annotations": {
              "bold": false,
              "italic": false,
              "strikethrough": false,
              "underline": false,
              "code": false,
              "color": "default"
            }
          }
        ]
      },
      {
        "id": "6673c9e8-4b28-4eed-9b12-a00d1d1af943",
        "type": "paragraph",
        "richText": [
          {
            "text": "芝浦祭2025で行った個人制作・展示。「入力はあなたです」をテーマに、サークル活動で学んだ表現を一つの展示へまとめた。",
            "href": null,
            "annotations": {
              "bold": false,
              "italic": false,
              "strikethrough": false,
              "underline": false,
              "code": false,
              "color": "default"
            }
          }
        ]
      },
      {
        "id": "daa2781b-75b7-4417-acb8-419dd03c22f4",
        "type": "heading_2",
        "richText": [
          {
            "text": "担当と実装",
            "href": null,
            "annotations": {
              "bold": false,
              "italic": false,
              "strikethrough": false,
              "underline": false,
              "code": false,
              "color": "default"
            }
          }
        ]
      },
      {
        "id": "4259894a-b346-4149-bcd8-40efcac4a8ab",
        "type": "bulleted_list_item",
        "richText": [
          {
            "text": "企画から制作、展示まで担当。",
            "href": null,
            "annotations": {
              "bold": false,
              "italic": false,
              "strikethrough": false,
              "underline": false,
              "code": false,
              "color": "default"
            }
          }
        ]
      },
      {
        "id": "f8e76582-5adc-4e14-955e-20993f70140c",
        "type": "bulleted_list_item",
        "richText": [
          {
            "text": "TouchDesignerでVJシステムを構築し、複数の作品をコンポーネントごとに整理。",
            "href": null,
            "annotations": {
              "bold": false,
              "italic": false,
              "strikethrough": false,
              "underline": false,
              "code": false,
              "color": "default"
            }
          }
        ]
      },
      {
        "id": "db5d2f8b-f2df-47e8-984d-feaf3e79bbae",
        "type": "bulleted_list_item",
        "richText": [
          {
            "text": "Blender、Unreal Engine 5を制作に使用。",
            "href": null,
            "annotations": {
              "bold": false,
              "italic": false,
              "strikethrough": false,
              "underline": false,
              "code": false,
              "color": "default"
            }
          }
        ]
      },
      {
        "id": "546d1737-e2e3-41c7-912b-a350de7fa5b5",
        "type": "heading_2",
        "richText": [
          {
            "text": "記録",
            "href": null,
            "annotations": {
              "bold": false,
              "italic": false,
              "strikethrough": false,
              "underline": false,
              "code": false,
              "color": "default"
            }
          }
        ]
      },
      {
        "id": "6719efca-b0bb-4298-b4f1-6bb9083ea20a",
        "type": "paragraph",
        "richText": [
          {
            "text": "展示投稿",
            "href": "https://www.instagram.com/p/DQ0nX_tEQ4K/",
            "annotations": {
              "bold": false,
              "italic": false,
              "strikethrough": false,
              "underline": false,
              "code": false,
              "color": "default"
            }
          }
        ]
      },
      {
        "id": "9588e11d-8b93-4417-8512-423c66e17edf",
        "type": "paragraph",
        "richText": [
          {
            "text": "ShibaLabの展示動画",
            "href": "https://www.instagram.com/reel/DQ12mesElVY/",
            "annotations": {
              "bold": false,
              "italic": false,
              "strikethrough": false,
              "underline": false,
              "code": false,
              "color": "default"
            }
          }
        ]
      },
      {
        "id": "4ffbcaad-9089-47af-9c80-04439f2f0981",
        "type": "paragraph",
        "richText": [
          {
            "text": "Untitled",
            "href": "https://app.notion.com/p/32407820ded980b79e31daf2cd70657b",
            "annotations": {
              "bold": false,
              "italic": false,
              "strikethrough": false,
              "underline": false,
              "code": false,
              "color": "default"
            }
          }
        ]
      }
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
    ],
    "featured": false,
    "body": [
      {
        "id": "37966ab5-7544-47a4-ab01-9b107492d92f",
        "type": "heading_2",
        "richText": [
          {
            "text": "概要",
            "href": null,
            "annotations": {
              "bold": false,
              "italic": false,
              "strikethrough": false,
              "underline": false,
              "code": false,
              "color": "default"
            }
          }
        ]
      },
      {
        "id": "21eb15c4-f29e-4be3-97a2-b648d9eb56f6",
        "type": "paragraph",
        "richText": [
          {
            "text": "大宮祭2025でのインタラクティブ作品。入場した自分自身の姿をアナログテレビへ再投影し、日常から少しずれた「違和感」を表現した。",
            "href": null,
            "annotations": {
              "bold": false,
              "italic": false,
              "strikethrough": false,
              "underline": false,
              "code": false,
              "color": "default"
            }
          }
        ]
      },
      {
        "id": "2ea3c297-c43a-4a8b-9a90-da414730f96f",
        "type": "heading_2",
        "richText": [
          {
            "text": "担当と実装",
            "href": null,
            "annotations": {
              "bold": false,
              "italic": false,
              "strikethrough": false,
              "underline": false,
              "code": false,
              "color": "default"
            }
          }
        ]
      },
      {
        "id": "6dbf26bf-937f-4f0b-9d27-58ef75d09f33",
        "type": "bulleted_list_item",
        "richText": [
          {
            "text": "カメラに装飾を施し、来場者がのぞくきっかけを設計。",
            "href": null,
            "annotations": {
              "bold": false,
              "italic": false,
              "strikethrough": false,
              "underline": false,
              "code": false,
              "color": "default"
            }
          }
        ]
      },
      {
        "id": "38290b16-e6a2-4dae-83f2-4c8f84548842",
        "type": "bulleted_list_item",
        "richText": [
          {
            "text": "顔認識にOpenCV、インタラクティブなシステム構築にTouchDesignerを使用。",
            "href": null,
            "annotations": {
              "bold": false,
              "italic": false,
              "strikethrough": false,
              "underline": false,
              "code": false,
              "color": "default"
            }
          }
        ]
      },
      {
        "id": "750b0680-2601-4019-aa21-536b855899b4",
        "type": "bulleted_list_item",
        "richText": [
          {
            "text": "アナログテレビを表示媒体として採用。",
            "href": null,
            "annotations": {
              "bold": false,
              "italic": false,
              "strikethrough": false,
              "underline": false,
              "code": false,
              "color": "default"
            }
          }
        ]
      },
      {
        "id": "3e483863-ba56-41b2-a7b2-f80adac9f16e",
        "type": "heading_2",
        "richText": [
          {
            "text": "記録",
            "href": null,
            "annotations": {
              "bold": false,
              "italic": false,
              "strikethrough": false,
              "underline": false,
              "code": false,
              "color": "default"
            }
          }
        ]
      },
      {
        "id": "9b351c47-f1d8-4eb1-9e2e-ded91a5c8871",
        "type": "paragraph",
        "richText": [
          {
            "text": "展示動画",
            "href": "https://www.instagram.com/reel/DVYid3ckVEq/",
            "annotations": {
              "bold": false,
              "italic": false,
              "strikethrough": false,
              "underline": false,
              "code": false,
              "color": "default"
            }
          }
        ]
      },
      {
        "id": "7adae0ea-8ff6-4fa4-b862-ee45f989422a",
        "type": "paragraph",
        "richText": [
          {
            "text": "Untitled",
            "href": "https://app.notion.com/p/32407820ded98068a08ada8f2da80f58",
            "annotations": {
              "bold": false,
              "italic": false,
              "strikethrough": false,
              "underline": false,
              "code": false,
              "color": "default"
            }
          }
        ]
      }
    ]
  },
  {
    "id": "06",
    "slug": "handpipe",
    "title": "Handpipe",
    "category": "app",
    "type": "BUILD",
    "stack": [
      "Next.js",
      "TypeScript",
      "MediaPipe",
      "Interaction"
    ],
    "summary": "カメラで検出した手の動きで、カーソル・クリック・スクロール・前後移動を行うブラウザ操作のMVP。",
    "role": "企画、インタラクション設計、フロントエンド実装",
    "year": "2026",
    "status": "In progress",
    "links": {
      "demo": "",
      "github": "https://github.com/Mino829/handpipe",
      "figma": ""
    },
    "thumbnail": "/images/works/handpipe.png",
    "images": [],
    "points": [
      "MediaPipe Tasks Visionで手の特徴点をブラウザ内で検出。",
      "人差し指の移動、ピンチ、手の上下移動、スワイプを操作へ割り当て。",
      "感度調整と認識状態の表示を備えた操作画面を実装。"
    ],
    "featured": false,
    "body": []
  },
  {
    "id": "07",
    "slug": "umlgen",
    "title": "umlgen",
    "category": "app",
    "type": "BUILD",
    "stack": [
      "Go",
      "Tree-sitter",
      "PlantUML"
    ],
    "summary": "JavaとGoのソースコードをローカルで解析し、編集可能なクラス図を生成するCLI。変更差分や注目する型の可視化にも対応。",
    "role": "CLI設計・実装、解析処理、テスト、CI",
    "year": "2026",
    "status": "Published",
    "links": {
      "demo": "",
      "github": "https://github.com/Mino829/umlgen",
      "figma": ""
    },
    "thumbnail": "/images/works/umlgen-diagram.svg",
    "images": [
      "/images/works/umlgen-diff.svg"
    ],
    "points": [
      "JavaはTree-sitter、Goは標準ASTで型と関係を抽出。",
      "PlantUMLとSVGを出力し、対象型の絞り込みやGit差分の色分けに対応。",
      "Pull Request向けの差分図生成ワークフローを公開。"
    ],
    "featured": false,
    "body": []
  }
];
