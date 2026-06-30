import ProductView from './product-view';

const CATALOG_DB = [
  { id: 1, name: 'Капучино от Робота', desc: 'Классический эспрессо, смешанный с идеальной микропеной. Температура взбивания контролируется с точностью до 0.1°C.', type: 'hot', sizes: ['S', 'M', 'L'], price: 250, img: '☕', code: 'CPU-01' },
];

export async function generateStaticParams() {
  return CATALOG_DB.map((product) => ({ id: product.id.toString() }));
}

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const product = CATALOG_DB.find(p => p.id === parseInt(id)) || CATALOG_DB[0];

  return <ProductView product={product} />;
}