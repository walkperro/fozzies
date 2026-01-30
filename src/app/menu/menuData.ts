export const MENU_META = {
  title: "Fozzie’s",
  subtitle: "Dinner menu — updated seasonally.",
  glutenFreeNote: "* = Gluten Free",
  splitFee: "Split Fee Charge — $10",
  reservations: "Reservations — OpenTable",
  hours: [
    { label: "Dinner", value: "Tues–Sat • 5–9 pm" },
    { label: "Happy Hour", value: "Tues–Sat • 4–6 pm" },
  ],
  faq: [
    { label: "Dress Code", value: "Smart casual" },
    { label: "Reservations", value: "Recommended" },
  ],
  social: [
    { label: "FB", value: "—" },
    { label: "IG", value: "—" },
  ],
};

export type MenuItem = {
  name: string;
  gf?: boolean;
  desc?: string[];
};

export type MenuSection = {
  title: string;
  subtitle?: string;
  items: MenuItem[];
};

export const MENU_SECTIONS: MenuSection[] = [
  {
    title: "Beginnings",
    subtitle: "Appetizers",
    items: [
      {
        name: "Sweet Homemade Rolls",
        desc: ["Honey compound butter"],
      },
      {
        name: "Avery’s Fried Pickles",
        gf: true,
        desc: ["Housemade pickles", "Sriracha aioli or jalapeño ranch"],
      },
      {
        name: "Stuffed Portobello Caps",
        gf: true,
        desc: [
          "Spinach, sun-dried tomatoes, goat cheese",
          "Bell peppers, onions, shaved parmesan",
        ],
      },
      {
        name: "Waka Waka Shrimp",
        gf: true,
        desc: ["Crispy gulf shrimp", "Waka Waka sauce"],
      },
      {
        name: "Soup du Jour",
        desc: ["Cup or bowl", "Daily chef’s selection"],
      },
      {
        name: "Seasonal Flatbread",
      },
      {
        name: "Crab Cakes",
        desc: ["Lump crab meat", "Corn relish", "Waka Waka sauce"],
      },
    ],
  },
  {
    title: "Mains",
    items: [
      {
        name: "Shrimp & Grits",
        gf: true,
        desc: ["Gulf shrimp", "Seasonal vegetables", "Gorda grits"],
      },
      {
        name: "Sara’s Southwest Pasta",
        desc: [
          "Southwest cream sauce",
          "Fettuccine",
          "Grilled chicken",
          "Can sub shrimp or salmon",
        ],
      },
      {
        name: "Smoked Pork Belly",
        gf: true,
        desc: ["Sweet chili glaze", "Jasmine rice", "Haricot verts", "Sriracha aioli"],
      },
      {
        name: "B & C’s Salmon",
        gf: true,
        desc: [
          "Blackened salmon fillet",
          "Hot honey citrus glaze",
          "Sweet potato hash",
          "Crispy Brussels",
        ],
      },
      {
        name: "Fozzie’s Burger of the Week",
        desc: ["Fries", "Creole ketchup"],
      },
      {
        name: "Steak Fries",
        gf: true,
        desc: [
          "Wagyu flat iron",
          "Fries",
          "Housemade horseradish",
          "Creole ketchup",
          "Add over-easy eggs",
        ],
      },
      {
        name: "Fresh Gulf Catch",
        gf: true,
        desc: [
          "Chef’s selection (grilled or blackened)",
          "Gorda grits",
          "Seasonal vegetables",
        ],
      },
      {
        name: "Seasonal Salad",
        desc: ["Add chicken, shrimp, or salmon"],
      },
      {
        name: "Spanish Salad",
        desc: ["Add chicken, shrimp, or salmon"],
      },
    ],
  },
  {
    title: "Desserts",
    items: [
      { name: "Bread Pudding" },
      { name: "Mousse", desc: ["Chef’s selection"] },
      { name: "Brownie Sundae", gf: true, desc: ["Salted caramel ice cream"] },
      { name: "Crème Brûlée", gf: true },
    ],
  },
];
