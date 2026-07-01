import ProductView from './product-view';

// Наша расширенная база данных для корректного поиска по ID
const CATALOG_DB = [
  { id: 1, name: 'Капучино от Робота', desc: 'Классический эспрессо, смешанный с идеальной микропеной. Температура взбивания контролируется с точностью до 0.1°C.', type: 'hot', sizes: ['S', 'M', 'L'], price: 250, img: '☕', code: 'CPU-01' },
  { id: 2, name: 'Синтетический Латте', desc: 'Нежнейший кофейно-молочный микс, созданный по точным пропорциям нано-интеграции слоев.', type: 'hot', sizes: ['M', 'L'], price: 270, img: '🥛', code: 'CPU-02' },
  { id: 3, name: 'Кибер-Эспрессо', desc: 'Заряд чистой энергии прямой экстракции под давлением 9 бар для максимальной продуктивности.', type: 'hot', sizes: ['S'], price: 150, img: '⚡', code: 'CPU-03' },
  { id: 4, name: 'Флэт Уайт', desc: 'Плотный кофейный вкус с бархатистой структурой для истинных ценителей спешелти арабики.', type: 'hot', sizes: ['S', 'M'], price: 280, img: '☕', code: 'CTL-04' },
  { id: 5, name: 'Раф "Машинное масло"', desc: 'Авторский раф с добавлением натурального секретного кордиала, создающего неповторимую текстуру.', type: 'hot', sizes: ['M', 'L'], price: 320, img: '🍯', code: 'CTL-05' },
  { id: 6, name: 'Матча на альтернативном', desc: 'Японская церемониальная матча, взбитая бамбуковым венчиком на растительной основе.', type: 'hot', sizes: ['S', 'M', 'L'], price: 350, img: '🍵', code: 'CTL-06' },
  { id: 7, name: 'Айс-Американо 2.0', desc: 'Освежающий холодный американо мгновенного охлаждения с ледяными кристаллами правильной формы.', type: 'cold', sizes: ['M', 'L'], price: 180, img: '🧊', code: 'CTL-07' },
  { id: 8, name: 'Нитро-Колд Брю', desc: 'Кофе холодной заварки, обогащенный азотом для получения невероятно шелковистой пены.', type: 'cold', sizes: ['S', 'M'], price: 300, img: '🥃', code: 'CTL-08' },
  { id: 9, name: 'Грейпфрутовый Эспрессо-Тоник', desc: 'Слоистый тонизирующий напиток со свежевыжатым цитрусовым соком и горьковатым послевкусием.', type: 'cold', sizes: ['L'], price: 340, img: '🍹', code: 'CTL-09' },
];

export async function generateStaticParams() {
  return CATALOG_DB.map((product) => ({ id: product.id.toString() }));
}

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const product = CATALOG_DB.find(p => p.id === parseInt(id)) || CATALOG_DB[0];

  return <ProductView product={product} />;
}