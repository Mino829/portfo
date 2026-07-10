export const categories = [
  { id: "all", label: "ALL", route: "#/works" },
  { id: "app", label: "APPS", route: "#/apps" },
  { id: "design", label: "DESIGN", route: "#/design" },
];

export const works = [
  {
    id: "01",
    slug: "portfolio-site",
    title: "Portfolio Site",
    category: "app",
    type: "CASE STUDY",
    stack: ["React", "Vite", "Figma", "Content Design"],
    summary:
      "就活用のポートフォリオを、作品主役の情報設計と強いアートディレクションで構成。",
    role: "Design direction, frontend implementation, content structure",
    year: "2026",
    status: "In progress",
    links: {
      demo: "",
      github: "",
      figma: "https://www.figma.com/design/NsCDLli3aVdxVDIqV33EXZ",
    },
    points: [
      "Works Firstの構成で、プロフィールより制作物を先に見せる。",
      "Notionで作品情報を管理できるよう、データ層を分離。",
      "PC/モバイル両方で編集的なタイポグリッドを維持。",
    ],
  },
  {
    id: "02",
    slug: "ui-prototype",
    title: "UI Prototype",
    category: "design",
    type: "PROCESS",
    stack: ["Figma", "User Flow", "Interaction"],
    summary:
      "ユーザー導線を検証するためのプロトタイプ。画面遷移、状態、操作感まで整理。",
    role: "UI design, prototyping, flow documentation",
    year: "2026",
    status: "Draft",
    links: {
      demo: "",
      github: "",
      figma: "",
    },
    points: [
      "ユーザーの入口から完了状態までを一枚の流れで整理。",
      "状態差分とインタラクションをFigma上で検証。",
      "実装前に情報量と操作感の違和感を減らす。",
    ],
  },
  {
    id: "03",
    slug: "web-application",
    title: "Web Application",
    category: "app",
    type: "BUILD",
    stack: ["React", "API", "State Management"],
    summary:
      "API連携と状態管理を含むWebアプリケーション。実装の判断理由を説明できる構成。",
    role: "Frontend development, API integration, accessibility review",
    year: "2026",
    status: "Planned",
    links: {
      demo: "",
      github: "",
      figma: "",
    },
    points: [
      "データ取得、状態管理、表示状態を明確に分離。",
      "アクセシビリティとレスポンシブを初期設計に含める。",
      "制作背景、課題、担当範囲を詳細ページに集約。",
    ],
  },
];

export const credits = [
  ["ROLE", "Student / Frontend Developer / UI-minded Builder"],
  ["STACK", "JavaScript, TypeScript, React, Next.js, HTML, CSS"],
  ["DESIGN", "Figma, responsive layout, interaction, information design"],
  ["METHOD", "Git, accessibility, API integration, writing, documentation"],
  ["VOICE", "見た目の強さと、採用で読まれる情報の順序を両立させる。"],
];
