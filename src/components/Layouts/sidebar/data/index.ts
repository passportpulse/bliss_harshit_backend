import * as Icons from "../icons";

export const NAV_DATA = [
  {
    label: "E-COMMERCE",
    items: [
      {
        title: "Dashboard",
        url: "/dashboard",
        icon: Icons.HomeIcon,
        items: [],
      },
      {
        title: "Orders",
        url: "/dashboard/orders",
        icon: Icons.Table,
        items: [],
      },
      {
        title: "Products",
        url: "/dashboard/products",
        icon: Icons.Calendar,
        items: [],
      },
      {
        title: "Categories",
        url: "/dashboard/categories",
        icon: Icons.User,
        items: [],
      },
      {
        title: "Subcategories",
        url: "/dashboard/subcategories",
        icon: Icons.Alphabet,
        items: [],
      },
    ],
  },
  {
    label: "CONTENT",
    items: [
      {
        title: "Blogs",
        icon: Icons.BlogIcon,
        items: [
          {
            title: "All Blogs",
            url: "/dashboard/blogs",
          },
          {
            title: "Create Blog",
            url: "/dashboard/blogs/create",
          },
        ],
      },
    ],
  },
  {
    label: "MANAGEMENT",
    items: [
      {
        title: "Consulting",
        url: "/dashboard/tables",
        icon: Icons.Table,
        items: [],
      },
         {
        title: "Testimonials",
        url: "/dashboard/testimonials",
        icon: Icons.Table,
        items: [],
      },
      {
        title: "Newsletter",
        url: "/dashboard/newsletter",
        icon: Icons.BlogIcon,
        items: [],
      },
      {
        title: "Banner",
        url: "/dashboard/banners",
        icon: Icons.BlogIcon,
        items: [],
      },
      {
        title: "Profile",
        icon: Icons.User,
        url: "/dashboard/profile",
        items: [],
      },
      {
        title: "Settings",
        icon: Icons.Alphabet,
        url: "/dashboard/settings",
        items: [],
      },
    ],
  },
];
