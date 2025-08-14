import { FiHome } from "react-icons/fi";
import { TbChartBarPopular } from "react-icons/tb";
import { LiaQuestionSolid } from "react-icons/lia";
import { MdDensitySmall } from "react-icons/md";

export const menuItems: MenuItem[] = [
  {
    id: 1,
    title: "Home",
    slug: "/",
    icon: <FiHome size={20} />,
  },
  {
    id: 2,
    title: "Popular",
    slug: "/popular",
    icon: <TbChartBarPopular size={20} />,
  },
  {
    id: 3,
    title: "Questions",
    slug: "/questions",
    icon: <LiaQuestionSolid size={20} />,
  },
  {
    id: 4,
    title: "All",
    slug: "/all",
    icon: <MdDensitySmall size={20} />,
  },
];

export interface MenuItem {
  id: number;
  title: string;
  slug: string;
  icon: React.ReactNode;
  submenu?: MenuItem[];
}
