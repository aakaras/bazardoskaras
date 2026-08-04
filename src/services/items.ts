import { db, isConfigured } from "@/lib/firebase";
import { 
  collection, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  getDocs, 
  getDoc,
  query,
  orderBy,
  increment
} from "firebase/firestore";

export type ItemStatus = "draft" | "available" | "negotiating" | "sold";

export const CATEGORIES = [
  "Móveis",
  "Eletrodomésticos",
  "Eletrônicos",
  "Utensílios / Casa",
  "Decoração",
  "Brinquedos / Infantil",
  "Outros"
] as const;

export type ItemCategory = typeof CATEGORIES[number] | string;

export interface Item {
  id?: string;
  title: string;
  description: string;
  price: number;
  category?: ItemCategory;
  images: string[];
  status: ItemStatus;
  interestedCount?: number;
  createdAt: number;
}

export interface Reservation {
  id?: string;
  itemId: string;
  buyerName: string;
  buyerPhone: string;
  createdAt: number;
}

// MOCK DATA FOR PREVIEW WHEN FIREBASE IS NOT CONFIGURED
const MOCK_ITEMS: Item[] = [
  {
    id: "mock-1",
    title: "Sofá Retrátil 3 Lugares Cinza",
    description: "Sofá muito confortável, usado por apenas 1 ano. Sem manchas ou rasgos. Medidas: 2,20m x 1,10m (fechado) e 1,60m (aberto).",
    price: 1200,
    category: "Móveis",
    images: ["https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&q=80&w=800"],
    status: "available",
    interestedCount: 0,
    createdAt: Date.now() - 100000
  },
  {
    id: "mock-2",
    title: "Mesa de Jantar de Madeira + 6 Cadeiras",
    description: "Mesa maciça linda. Tem alguns pequenos arranhões de uso no tampo, mas no geral está em ótimo estado.",
    price: 850,
    category: "Móveis",
    images: ["https://images.unsplash.com/photo-1617806118233-18e1c094f01e?auto=format&fit=crop&q=80&w=800"],
    status: "negotiating",
    interestedCount: 2,
    createdAt: Date.now() - 200000
  },
  {
    id: "mock-3",
    title: "TV Smart LG 55' 4K",
    description: "Smart TV funcionando perfeitamente, acompanha controle original. Excelente imagem.",
    price: 1800,
    category: "Eletrônicos",
    images: ["https://images.unsplash.com/photo-1593784991095-a205069470b6?auto=format&fit=crop&q=80&w=800"],
    status: "sold",
    interestedCount: 1,
    createdAt: Date.now() - 300000
  },
  {
    id: "mock-4",
    title: "Luminária de Chão Vintage (Rascunho)",
    description: "Luminária em latão com iluminação suave. Em fase de preparação.",
    price: 350,
    category: "Decoração",
    images: ["https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&q=80&w=800"],
    status: "draft",
    interestedCount: 0,
    createdAt: Date.now() - 50000
  }
];

// ITEMS
export async function getItems(): Promise<Item[]> {
  if (!isConfigured) return MOCK_ITEMS;
  
  const q = query(collection(db, "items"), orderBy("createdAt", "desc"));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Item));
}

export async function getPublicItems(): Promise<Item[]> {
  const allItems = await getItems();
  return allItems.filter(item => item.status !== "draft");
}

export async function getItem(id: string): Promise<Item | null> {
  if (!isConfigured) {
    return MOCK_ITEMS.find(item => item.id === id) || null;
  }
  
  const docRef = doc(db, "items", id);
  const snapshot = await getDoc(docRef);
  if (snapshot.exists()) {
    return { id: snapshot.id, ...snapshot.data() } as Item;
  }
  return null;
}

export async function createItem(item: Omit<Item, "id" | "createdAt">): Promise<string> {
  if (!isConfigured) {
    alert("Operação indisponível em modo de visualização (Firebase não configurado).");
    return "mock-id";
  }
  
  const docRef = await addDoc(collection(db, "items"), {
    ...item,
    interestedCount: item.interestedCount || 0,
    createdAt: Date.now(),
  });
  return docRef.id;
}

export async function updateItem(id: string, itemData: Partial<Omit<Item, "id" | "createdAt">>): Promise<void> {
  if (!isConfigured) {
    alert("Operação indisponível em modo de visualização.");
    return;
  }
  const docRef = doc(db, "items", id);
  await updateDoc(docRef, itemData);
}

export async function updateItemStatus(id: string, status: ItemStatus): Promise<void> {
  if (!isConfigured) {
    alert("Operação indisponível em modo de visualização.");
    return;
  }
  const docRef = doc(db, "items", id);
  await updateDoc(docRef, { status });
}

export async function deleteItem(id: string, images: string[]): Promise<void> {
  if (!isConfigured) {
    alert("Operação indisponível em modo de visualização.");
    return;
  }
  
  await deleteDoc(doc(db, "items", id));
}

// UPLOAD IMAGE WITH IMGBB
export async function uploadImage(file: File): Promise<string> {
  if (!isConfigured) {
    return URL.createObjectURL(file); // Fake upload for preview
  }
  
  const imgbbKey = process.env.NEXT_PUBLIC_IMGBB_API_KEY;
  if (!imgbbKey) {
    throw new Error("ImgBB API Key is missing!");
  }

  const formData = new FormData();
  formData.append("image", file);

  const response = await fetch(`https://api.imgbb.com/1/upload?key=${imgbbKey}`, {
    method: "POST",
    body: formData,
  });

  const data = await response.json();
  
  if (data.success) {
    return data.data.url;
  } else {
    throw new Error("Falha ao fazer upload da imagem");
  }
}

// RESERVATIONS
export async function createReservation(reservation: Omit<Reservation, "id" | "createdAt">): Promise<string> {
  if (!isConfigured) {
    const mockItem = MOCK_ITEMS.find(i => i.id === reservation.itemId);
    if (mockItem) {
      mockItem.status = "negotiating";
      mockItem.interestedCount = (mockItem.interestedCount || 0) + 1;
    }
    return "mock-reservation-id";
  }
  
  const docRef = await addDoc(collection(db, "reservations"), {
    ...reservation,
    createdAt: Date.now(),
  });
  
  // Update item status to negotiating and increment interested count
  const itemDocRef = doc(db, "items", reservation.itemId);
  const itemSnap = await getDoc(itemDocRef);
  const currentStatus = itemSnap.exists() ? itemSnap.data().status : "available";

  await updateDoc(itemDocRef, {
    status: currentStatus === "sold" ? "sold" : "negotiating",
    interestedCount: increment(1)
  });
  
  return docRef.id;
}

export async function getReservations(): Promise<Reservation[]> {
  if (!isConfigured) return [];
  const q = query(collection(db, "reservations"), orderBy("createdAt", "desc"));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Reservation));
}
