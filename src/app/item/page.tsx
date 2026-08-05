import { Metadata, ResolvingMetadata } from "next";
import { getItem } from "@/services/items";
import ItemDetailsClient from "./ItemDetailsClient";

export const dynamic = 'force-dynamic';

type Props = {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
};

export async function generateMetadata(
  props: Props,
  parent: ResolvingMetadata
): Promise<Metadata> {
  const searchParams = await props.searchParams;
  const id = typeof searchParams.id === "string" ? searchParams.id : undefined;

  if (!id) {
    return {
      title: "Item não encontrado | Bazar da Mudança",
    };
  }

  try {
    const item = await getItem(id);
    
    if (!item) {
      return {
        title: "Item não encontrado | Bazar da Mudança",
      };
    }

    const previousImages = (await parent).openGraph?.images || [];
    const itemImage = item.images.length > 0 ? item.images[0] : null;

    return {
      title: `${item.title} | Bazar da Mudança`,
      description: `Olha esse item no Bazar da Mudança: ${item.title} por R$ ${item.price.toFixed(2).replace('.', ',')}`,
      openGraph: {
        title: `${item.title} | Bazar da Mudança`,
        description: `Confira este item por R$ ${item.price.toFixed(2).replace('.', ',')} no Bazar da Mudança!`,
        images: itemImage ? [itemImage, ...previousImages] : previousImages,
      },
      twitter: {
        card: 'summary_large_image',
        title: `${item.title} | Bazar da Mudança`,
        description: `Confira este item por R$ ${item.price.toFixed(2).replace('.', ',')} no Bazar da Mudança!`,
        images: itemImage ? [itemImage] : [],
      }
    };
  } catch (error) {
    console.error("Error generating metadata for item", id, error);
    return {
      title: "Detalhes do Item | Bazar da Mudança",
    };
  }
}

export default function ItemPage() {
  return <ItemDetailsClient />;
}
