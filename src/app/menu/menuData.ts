export const MENU_META = {
  title: "Fozzie’s",
  subtitle: "Dinner menu — updated seasonally.",
  glutenFreeNote: "* gluten-free options available",
  splitFee: "split-fee charge — $10",
  reservations: "Reservations — OpenTable",
  hours: [
    { label: "Dinner", value: "Tuesday–Saturday | 5:00–9:00 PM" },
    { label: "Happy Hour", value: "Tuesday–Saturday | 4:00–6:00 PM" },
  ],
  faq: [
    { label: "Dress Code", value: "Smart casual" },
    { label: "Reservations", value: "Recommended" },
  ],
  social: [
    { label: "Facebook", value: "—" },
    { label: "Instagram", value: "—" },
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
    items: [
      { name: "Sweet Homemade Rolls", desc: ["honey compound butter"] },
      {
        name: "Avery’s Fried Pickles",
        gf: true,
        desc: ["housemade pickles", "sriracha aioli or jalapeño ranch"],
      },
      {
        name: "Stuffed Portobello Caps",
        gf: true,
        desc: ["spinach, sun-dried tomatoes, goat cheese, bell peppers, onions, shaved parmesan"],
      },
      { name: "Waka Waka Shrimp", gf: true, desc: ["crispy gulf shrimp", "waka waka sauce"] },
      { name: "Soup de Lour", desc: ["cup or bowl", "daily chef’s selection"] },
      { name: "Crab Cakes", desc: ["lump crab meat", "corn relish", "waka waka sauce"] },
      { name: "Seasonal Flatbread" },
    ],
  },
  {
    title: "Mains",
    items: [
      { name: "Shrimp & Grits", gf: true, desc: ["gulf shrimp", "seasonal vegetables", "gorda grits"] },
      {
        name: "Sara’s Southwest Pasta",
        desc: ["southwest cream sauce, fettuccine, grilled chicken", "can substitute shrimp or salmon"],
      },
      { name: "Smoked Pork Belly", gf: true, desc: ["sweet chili glaze", "jasmine rice", "haricots verts", "sriracha aioli"] },
      {
        name: "B & C’s Salmon",
        gf: true,
        desc: ["blackened salmon fillet", "hot honey citrus glaze", "sweet potato hash", "crispy brussels sprouts"],
      },
      { name: "Fozzie’s Burger of the Week", desc: ["chef’s weekly selection, fries, creole ketchup"] },
      {
        name: "Steak Frites",
        gf: true,
        desc: ["wagyu flat iron", "fries", "housemade horseradish", "creole ketchup", "add over-easy eggs"],
      },
      {
        name: "Fresh Gulf Catch",
        gf: true,
        desc: ["chef’s selection", "grilled or blackened", "gorda grits", "seasonal vegetables"],
      },
      { name: "Seasonal Salad", desc: ["add chicken, shrimp, or salmon"] },
      { name: "Spanish Salad", desc: ["add chicken, shrimp, or salmon"] },
    ],
  },
  {
    title: "Desserts",
    items: [
      { name: "Bread Pudding", desc: ["chef’s seasonal selection"] },
      { name: "Mousse", desc: ["chef’s selection"] },
      { name: "Brownie Sundae", desc: ["salted caramel ice cream"] },
      { name: "Crème Brûlée" },
      { name: "Housemade Rolls", desc: ["chef’s selection"] },
    ],
  },
];
