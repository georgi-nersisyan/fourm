import { FiHome } from "react-icons/fi";
import { TbChartBarPopular } from "react-icons/tb";
import { LiaQuestionSolid } from "react-icons/lia";
import { MdDensitySmall } from "react-icons/md";
<<<<<<< HEAD
import { FiBookmark, FiBell, FiAward, FiMessageCircle } from "react-icons/fi";
=======
>>>>>>> 3879534 (extend profile and add validation)

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
<<<<<<< HEAD
  {
    id: 5,
    title: "Bookmarks",
    slug: "/bookmarks",
    icon: <FiBookmark size={20} />,
  },
  {
    id: 6,
    title: "Notifications",
    slug: "/notifications",
    icon: <FiBell size={20} />,
  },
  {
    id: 7,
    title: "Achievements",
    slug: "/achievements",
    icon: <FiAward size={20} />,
  },
  {
    id: 8,
    title: "Chats",
    slug: "/chat",
    icon: <FiMessageCircle size={20} />,
  },
=======
>>>>>>> 3879534 (extend profile and add validation)
];

export interface MenuItem {
  id: number;
  title: string;
  slug: string;
  icon: React.ReactNode;
  submenu?: MenuItem[];
}
