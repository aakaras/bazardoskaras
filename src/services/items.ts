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
  orderBy
} from "firebase/firestore";

export type ItemStatus = "available" | "negotiating" | "sold";

export interface Item {
  id?: string;
  title: string;
  description: string;
  price: number;
  images: string[];
  status: ItemStatus;
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
    images: ["https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&q=80&w=800"],
    status: "available",
    createdAt: Date.now() - 100000
  },
  {
    id: "mock-2",
    title: "Mesa de Jantar de Madeira + 6 Cadeiras",
    description: "Mesa maciça linda. Tem alguns pequenos arranhões de uso no tampo, mas no geral está em ótimo estado.",
    price: 850,
    images: ["https://images.unsplash.com/photo-1617806118233-18e1c094f01e?auto=format&fit=crop&q=80&w=800"],
    status: "negotiating",
    createdAt: Date.now() - 200000
  },
  {
    id: "mock-3",
    title: "TV Smart LG 55' 4K",
    description: "Smart TV funcionando perfeitamente, acompanha controle original. Excelente imagem.",
    price: 1800,
    images: ["https://images.unsplash.com/photo-1593784991095-a205069470b6?auto=format&fit=crop&q=80&w=800"],
    status: "sold",
    createdAt: Date.now() - 300000
  }
];

// ITEMS
export async function getItems(): Promise<Item[]> {
  if (!isConfigured) return MOCK_ITEMS;
  
  const q = query(collection(db, "items"), orderBy("createdAt", "desc"));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Item));
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
    createdAt: Date.now(),
  });
  return docRef.id;
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
  
  // Note: ImgBB doesn't provide a simple delete API for anonymous uploads in the free tier
  // So we just leave the image there (it's isolated) and only delete the Firestore document
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
    return "mock-reservation-id";
  }
  
  const docRef = await addDoc(collection(db, "reservations"), {
    ...reservation,
    createdAt: Date.now(),
  });
  
  // Update item status to negotiating
  await updateItemStatus(reservation.itemId, "negotiating");
  
  return docRef.id;
}

export async function getReservations(): Promise<Reservation[]> {
  if (!isConfigured) return [];
  const q = query(collection(db, "reservations"), orderBy("createdAt", "desc"));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Reservation));
}
