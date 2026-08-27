import type { NewProduct } from "@/db/schema";

const categoryOrder: Record<string, number> = {
  "Hambúrguers": 1,
  "Porções": 2,
  "Adicionais": 3,
  "Chopes": 4,
  "Shots": 5,
  "Drinks": 6,
  "Sem Álcool": 7,
  "Caipirinhas": 8,
  "Red Bull Combos": 9,
};

export const seedProducts: Omit<NewProduct, "id" | "createdAt">[] = [
  // Hambúrguers
  { name: "Juke Burguer", price: 25, category: "Hambúrguers", isSandwich: true, sortOrder: 1, active: true, ingredients: ["Pão","Queijo","Hambúrguer artesanal de carne","Maionese caseira","Tomate","Cebola crocante","Anéis de cebola"], duploPrice: null },
  { name: "Burguer Duplo", price: 30, category: "Hambúrguers", isSandwich: true, sortOrder: 2, active: true, ingredients: ["Pão","Queijo","Dois hambúrguers","Maionese da casa","Tomate","Crispy de cebola","Onion rings","Molho billy jack"], duploPrice: null },
  { name: "Juke Bacon", price: 27, category: "Hambúrguers", isSandwich: true, sortOrder: 3, active: true, ingredients: ["Pão","Queijo","Hambúrguer artesanal","Tiras de bacon","Barbecue","Tomate","Crispy de cebola","Onion rings"], duploPrice: null },
  { name: "Duplo Bacon", price: 32, category: "Hambúrguers", isSandwich: true, sortOrder: 4, active: true, ingredients: ["Pão","Queijo","Dois hambúrguers","Tiras de bacon","Barbecue","Tomate","Crispy de cebola","Onion rings"], duploPrice: null },
  { name: "Juke Pernil com Abacaxi", price: 28, category: "Hambúrguers", isSandwich: true, sortOrder: 5, active: true, ingredients: ["Pão","Queijo","Pernil","Maionese","Abacaxi em pedaços","Tomate","Cebola crocante","Anéis de cebola"], duploPrice: 33 },
  { name: "Vegetariano", price: 27, category: "Hambúrguers", isSandwich: true, sortOrder: 6, active: true, ingredients: ["Pão","Hambúrguer vegetariano","Maionese caseira","Picles","Alface","Tomate","Crispy de cebola","Anéis de cebola"], duploPrice: 32 },
  { name: "Juke Costela", price: 29, category: "Hambúrguers", isSandwich: true, sortOrder: 7, active: true, ingredients: ["Pão","Queijo","Hambúrguer de costela","Tomate","Molho barbecue","Crispy de cebola","Onion rings"], duploPrice: 34 },
  { name: "Juke Frango", price: 27, category: "Hambúrguers", isSandwich: true, sortOrder: 8, active: true, ingredients: ["Pão","Queijo","Hambúrguer de frango","Onion ring","Alface","Tomate","Cebola crocante","Maionese caseira"], duploPrice: 32 },

  // Porções
  { name: "Fritas 180g", price: 13, category: "Porções", isSandwich: false, sortOrder: 1, active: true, ingredients: [], duploPrice: null },
  { name: "Fritas 400g + Cheddar + Bacon", price: 35, category: "Porções", isSandwich: false, sortOrder: 2, active: true, ingredients: [], duploPrice: null },
  { name: "Aipim", price: 13, category: "Porções", isSandwich: false, sortOrder: 3, active: true, ingredients: [], duploPrice: null },
  { name: "Polenta", price: 13, category: "Porções", isSandwich: false, sortOrder: 4, active: true, ingredients: [], duploPrice: null },
  { name: "Bolinha de Queijo", price: 17, category: "Porções", isSandwich: false, sortOrder: 5, active: true, ingredients: [], duploPrice: null },
  { name: "Mini Coxinha", price: 17, category: "Porções", isSandwich: false, sortOrder: 6, active: true, ingredients: [], duploPrice: null },
  { name: "Quibe", price: 17, category: "Porções", isSandwich: false, sortOrder: 7, active: true, ingredients: [], duploPrice: null },
  { name: "Onion Rings", price: 17, category: "Porções", isSandwich: false, sortOrder: 8, active: true, ingredients: [], duploPrice: null },
  { name: "Nuggets", price: 18, category: "Porções", isSandwich: false, sortOrder: 9, active: true, ingredients: [], duploPrice: null },
  { name: "Churros", price: 18, category: "Porções", isSandwich: false, sortOrder: 10, active: true, ingredients: [], duploPrice: null },
  { name: "Amendoim", price: 6, category: "Porções", isSandwich: false, sortOrder: 11, active: true, ingredients: [], duploPrice: null },

  // Adicionais
  { name: "Cheddar", price: 3, category: "Adicionais", isSandwich: false, sortOrder: 1, active: true, ingredients: [], duploPrice: null },
  { name: "Bacon", price: 3, category: "Adicionais", isSandwich: false, sortOrder: 2, active: true, ingredients: [], duploPrice: null },
  { name: "Maionese da Casa", price: 2, category: "Adicionais", isSandwich: false, sortOrder: 3, active: true, ingredients: [], duploPrice: null },

  // Chopes
  { name: "Pilsen", price: 12, category: "Chopes", isSandwich: false, sortOrder: 1, active: true, ingredients: [], duploPrice: null },
  { name: "IPA Loka", price: 17, category: "Chopes", isSandwich: false, sortOrder: 2, active: true, ingredients: [], duploPrice: null },
  { name: "Avelã Porter", price: 16, category: "Chopes", isSandwich: false, sortOrder: 3, active: true, ingredients: [], duploPrice: null },
  { name: "Chope de Vinho", price: 12, category: "Chopes", isSandwich: false, sortOrder: 4, active: true, ingredients: [], duploPrice: null },
  { name: "Chope Ice", price: 12, category: "Chopes", isSandwich: false, sortOrder: 5, active: true, ingredients: [], duploPrice: null },

  // Shots
  { name: "Jambu", price: 16, category: "Shots", isSandwich: false, sortOrder: 1, active: true, ingredients: [], duploPrice: null },
  { name: "Tequiloka", price: 12, category: "Shots", isSandwich: false, sortOrder: 2, active: true, ingredients: [], duploPrice: null },
  { name: "Rabo de Galo", price: 10, category: "Shots", isSandwich: false, sortOrder: 3, active: true, ingredients: [], duploPrice: null },
  { name: "Conhaque", price: 9, category: "Shots", isSandwich: false, sortOrder: 4, active: true, ingredients: [], duploPrice: null },
  { name: "Jack Daniels", price: 24, category: "Shots", isSandwich: false, sortOrder: 5, active: true, ingredients: [], duploPrice: null },
  { name: "Rum", price: 10, category: "Shots", isSandwich: false, sortOrder: 6, active: true, ingredients: [], duploPrice: null },
  { name: "Licor 43", price: 23, category: "Shots", isSandwich: false, sortOrder: 7, active: true, ingredients: [], duploPrice: null },
  { name: "Fernet", price: 12, category: "Shots", isSandwich: false, sortOrder: 8, active: true, ingredients: [], duploPrice: null },
  { name: "Fire Ball", price: 23, category: "Shots", isSandwich: false, sortOrder: 9, active: true, ingredients: [], duploPrice: null },
  { name: "Jagermeister", price: 23, category: "Shots", isSandwich: false, sortOrder: 10, active: true, ingredients: [], duploPrice: null },
  { name: "Fire Licor Canela", price: 13, category: "Shots", isSandwich: false, sortOrder: 11, active: true, ingredients: [], duploPrice: null },
  { name: "Niña Licor de Banana", price: 13, category: "Shots", isSandwich: false, sortOrder: 12, active: true, ingredients: [], duploPrice: null },
  { name: "Campari", price: 13, category: "Shots", isSandwich: false, sortOrder: 13, active: true, ingredients: [], duploPrice: null },
  { name: "Vodka Hambre", price: 15, category: "Shots", isSandwich: false, sortOrder: 14, active: true, ingredients: [], duploPrice: null },

  // Drinks
  { name: "Quentão", price: 12, category: "Drinks", isSandwich: false, sortOrder: 1, active: true, ingredients: [], duploPrice: null },
  { name: "Cuba Libre", price: 16, category: "Drinks", isSandwich: false, sortOrder: 2, active: true, ingredients: [], duploPrice: null },
  { name: "Jambu Tônica", price: 22, category: "Drinks", isSandwich: false, sortOrder: 3, active: true, ingredients: [], duploPrice: null },
  { name: "Jambu Libre", price: 22, category: "Drinks", isSandwich: false, sortOrder: 4, active: true, ingredients: [], duploPrice: null },
  { name: "Gim Tônica", price: 22, category: "Drinks", isSandwich: false, sortOrder: 5, active: true, ingredients: [], duploPrice: null },
  { name: "Moscow Mule", price: 23, category: "Drinks", isSandwich: false, sortOrder: 6, active: true, ingredients: [], duploPrice: null },
  { name: "Moscow Mule Red", price: 23, category: "Drinks", isSandwich: false, sortOrder: 7, active: true, ingredients: [], duploPrice: null },
  { name: "Pink Vodka Limonade", price: 23, category: "Drinks", isSandwich: false, sortOrder: 8, active: true, ingredients: [], duploPrice: null },
  { name: "Jack and Coke", price: 30, category: "Drinks", isSandwich: false, sortOrder: 9, active: true, ingredients: [], duploPrice: null },
  { name: "Vodka com Energético", price: 22, category: "Drinks", isSandwich: false, sortOrder: 10, active: true, ingredients: [], duploPrice: null },
  { name: "Jager Bomb", price: 28, category: "Drinks", isSandwich: false, sortOrder: 11, active: true, ingredients: [], duploPrice: null },
  { name: "Jager Hunter's Tea", price: 28, category: "Drinks", isSandwich: false, sortOrder: 12, active: true, ingredients: [], duploPrice: null },
  { name: "Negroni", price: 22, category: "Drinks", isSandwich: false, sortOrder: 13, active: true, ingredients: [], duploPrice: null },

  // Sem Álcool
  { name: "Soda Italiana", price: 16, category: "Sem Álcool", isSandwich: false, sortOrder: 1, active: true, ingredients: [], duploPrice: null },
  { name: "Italian Spritz", price: 16, category: "Sem Álcool", isSandwich: false, sortOrder: 2, active: true, ingredients: [], duploPrice: null },
  { name: "Refri, Suco e Mate", price: 7, category: "Sem Álcool", isSandwich: false, sortOrder: 3, active: true, ingredients: [], duploPrice: null },
  { name: "Água", price: 5, category: "Sem Álcool", isSandwich: false, sortOrder: 4, active: true, ingredients: [], duploPrice: null },

  // Caipirinhas
  { name: "Caipirinha de Limão", price: 15, category: "Caipirinhas", isSandwich: false, sortOrder: 1, active: true, ingredients: [], duploPrice: null },
  { name: "Caipirinha de Abacaxi", price: 15, category: "Caipirinhas", isSandwich: false, sortOrder: 2, active: true, ingredients: [], duploPrice: null },
  { name: "Caipirinha de Morango", price: 15, category: "Caipirinhas", isSandwich: false, sortOrder: 3, active: true, ingredients: [], duploPrice: null },
  { name: "Caipirinha de Maracujá", price: 15, category: "Caipirinhas", isSandwich: false, sortOrder: 4, active: true, ingredients: [], duploPrice: null },
  { name: "Caipirinha de Vinho", price: 20, category: "Caipirinhas", isSandwich: false, sortOrder: 5, active: true, ingredients: [], duploPrice: null },
  { name: "Caipirinha de Jambu", price: 20, category: "Caipirinhas", isSandwich: false, sortOrder: 6, active: true, ingredients: [], duploPrice: null },
  { name: "Caipirinha Materinha", price: 20, category: "Caipirinhas", isSandwich: false, sortOrder: 7, active: true, ingredients: [], duploPrice: null },

  // Red Bull Combos
  { name: "Vodka & Red Bull", price: 30, category: "Red Bull Combos", isSandwich: false, sortOrder: 1, active: true, ingredients: [], duploPrice: null },
  { name: "Meia Sete (Gin + Red Bull Sugarfree)", price: 30, category: "Red Bull Combos", isSandwich: false, sortOrder: 2, active: true, ingredients: [], duploPrice: null },
  { name: "Tropical Gin (Gin + Red Bull Tropical)", price: 30, category: "Red Bull Combos", isSandwich: false, sortOrder: 3, active: true, ingredients: [], duploPrice: null },
  { name: "Melancita (Gin + Red Bull Melancia)", price: 30, category: "Red Bull Combos", isSandwich: false, sortOrder: 4, active: true, ingredients: [], duploPrice: null },
  { name: "Red Bull", price: 16, category: "Red Bull Combos", isSandwich: false, sortOrder: 5, active: true, ingredients: [], duploPrice: null },
];

export { categoryOrder };
