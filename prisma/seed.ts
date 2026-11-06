import {
  PrismaClient,
  type OrderStatus,
  type OrderType,
  type PaymentMethod,
  type Prisma,
} from "@prisma/client";

const prisma = new PrismaClient();

const img = (id: string) =>
  `https://images.unsplash.com/${id}?auto=format&fit=crop&w=900&q=80`;

const DEMO_SLUGS = ["brasa-burger", "verde-vivo"];

interface SeedItem {
  product: string;
  quantity: number;
  options?: string[];
  notes?: string;
}

interface SeedOrder {
  sequence: number;
  status: OrderStatus;
  type: OrderType;
  payment: PaymentMethod;
  customerName: string;
  customerPhone: string;
  address?: string;
  tableNumber?: string;
  changeFor?: number;
  notes?: string;
  minutesAgo: number;
  completedMinutesAgo?: number;
  items: SeedItem[];
}

async function createSeedOrder(
  tenantId: string,
  deliveryFee: number,
  order: SeedOrder,
) {
  const products = await prisma.product.findMany({
    where: { tenantId },
    include: {
      optionGroups: {
        orderBy: { order: "asc" },
        include: { options: true },
      },
    },
  });

  const productByName = new Map(products.map((product) => [product.name, product]));

  const items = order.items.map((line) => {
    const product = productByName.get(line.product);
    if (!product) throw new Error(`Seed: produto "${line.product}" não encontrado`);

    const requested = new Set(line.options ?? []);
    const knownOptions = new Set(
      product.optionGroups.flatMap((group) => group.options.map((option) => option.name)),
    );
    for (const name of requested) {
      if (!knownOptions.has(name)) {
        throw new Error(
          `Seed: opção "${name}" não encontrada em "${line.product}"`,
        );
      }
    }

    const selected = product.optionGroups.flatMap((group) =>
      group.options
        .filter((option) => requested.has(option.name))
        .map((option) => ({
          groupId: group.id,
          groupName: group.name,
          optionId: option.id,
          optionName: option.name,
          price: Number(option.price.toString()),
        })),
    );

    const unitPrice =
      Number(product.price.toString()) +
      selected.reduce((sum, option) => sum + option.price, 0);
    const total = Number((unitPrice * line.quantity).toFixed(2));

    return {
      productId: product.id,
      name: product.name,
      quantity: line.quantity,
      unitPrice: unitPrice.toFixed(2),
      total: total.toFixed(2),
      notes: line.notes ?? null,
      options: selected as unknown as Prisma.InputJsonValue,
    };
  });

  const subtotal = Number(
    items.reduce((sum, item) => sum + Number(item.total), 0).toFixed(2),
  );
  const fee = order.type === "DELIVERY" ? deliveryFee : 0;
  const total = Number((subtotal + fee).toFixed(2));
  const createdAt = new Date(Date.now() - order.minutesAgo * 60_000);
  const updatedAt = new Date(
    Date.now() - (order.completedMinutesAgo ?? Math.max(1, order.minutesAgo - 1)) * 60_000,
  );
  const paid = order.status === "COMPLETED" || order.status === "DISPATCHED";

  return prisma.order.create({
    data: {
      tenantId,
      orderNumber: String(order.sequence).padStart(4, "0"),
      type: order.type,
      status: order.status,
      customerName: order.customerName,
      customerPhone: order.customerPhone,
      address: order.address ?? null,
      tableNumber: order.tableNumber ?? null,
      paymentMethod: order.payment,
      paymentStatus: paid ? "PAID" : "PENDING",
      paidAt: paid ? createdAt : null,
      changeFor: order.changeFor != null ? order.changeFor.toFixed(2) : null,
      notes: order.notes ?? null,
      subtotal: subtotal.toFixed(2),
      deliveryFee: fee.toFixed(2),
      total: total.toFixed(2),
      createdAt,
      updatedAt,
      items: { create: items },
    },
  });
}

async function main() {
  console.log("🌱 Limpando tenants de demonstração...");
  await prisma.tenant.deleteMany({ where: { slug: { in: DEMO_SLUGS } } });

  console.log("🍔 Criando Brasa Burger...");
  const brasa = await prisma.tenant.create({
    data: {
      id: "seed_brasa_burger",
      name: "Brasa Burger",
      slug: "brasa-burger",
      logo: "/brands/brasa-burger.svg",
      tagline: "Hambúrgueres artesanais na brasa, do jeito que você gosta.",
      primaryColor: "#ea580c",
      phone: "(11) 98888-1234",
      address: "Rua das Palmeiras, 128 — Vila Madalena, São Paulo/SP",
      deliveryFee: "7.90",
      isOpen: true,
      printSettings: {
        footerNote: "Obrigado pela preferência! Volte sempre. 🔥",
        receiptHeader: "Hambúrgueres artesanais na brasa",
        showLogo: true,
        paperWidthMm: 80,
      },
      paymentSettings: {
        create: {
          provider: "MANUAL",
          pixEnabled: true,
          cashEnabled: true,
          cardEnabled: true,
          pixKeyType: "CNPJ",
          pixKey: "12.345.678/0001-90",
          pixHolderName: "BRASA BURGER LTDA",
          pixCity: "SAO PAULO",
          instructions:
            "Pague pelo app do seu banco e envie o comprovante no WhatsApp (11) 98888-1234.",
        },
      },
      categories: {
        create: [
          {
            name: "Destaques",
            order: 0,
            products: {
              create: [
                {
                  name: "Brasa Clássico",
                  description:
                    "Blend 180g na brasa, cheddar inglês, bacon crocante, alface, tomate e molho da casa no pão brioche.",
                  price: "34.90",
                  imageUrl: img("photo-1568901346375-23c9450c58cd"),
                  tenantId: "seed_brasa_burger",
                  order: 0,
                  optionGroups: {
                    create: [
                      {
                        name: "Ponto da carne",
                        minChoices: 1,
                        maxChoices: 1,
                        order: 0,
                        options: {
                          create: [
                            { name: "Ao ponto", order: 0 },
                            { name: "Bem passado", order: 1 },
                            { name: "Mal passado", order: 2 },
                          ],
                        },
                      },
                      {
                        name: "Adicionais",
                        minChoices: 0,
                        maxChoices: 3,
                        order: 1,
                        options: {
                          create: [
                            { name: "Cheddar extra", price: "3.00", order: 0 },
                            { name: "Bacon extra", price: "5.00", order: 1 },
                            { name: "Ovo frito", price: "2.50", order: 2 },
                            { name: "Cebola caramelizada", price: "3.50", order: 3 },
                          ],
                        },
                      },
                    ],
                  },
                },
                {
                  name: "Duplo Fogo",
                  description:
                    "Dois blends de 150g, queijo americano, cebola crocante, geleia de pimenta e maionese defumada.",
                  price: "46.90",
                  imageUrl: img("photo-1553979459-d2229ba7433b"),
                  tenantId: "seed_brasa_burger",
                  order: 1,
                  optionGroups: {
                    create: [
                      {
                        name: "Ponto da carne",
                        minChoices: 1,
                        maxChoices: 1,
                        options: {
                          create: [
                            { name: "Ao ponto", order: 0 },
                            { name: "Bem passado", order: 1 },
                            { name: "Mal passado", order: 2 },
                          ],
                        },
                      },
                      {
                        name: "Nível de picância",
                        minChoices: 1,
                        maxChoices: 1,
                        order: 1,
                        options: {
                          create: [
                            { name: "Suave", order: 0 },
                            { name: "Médio", order: 1 },
                            { name: "Explosivo", order: 2 },
                          ],
                        },
                      },
                      {
                        name: "Adicionais",
                        minChoices: 0,
                        maxChoices: 3,
                        order: 2,
                        options: {
                          create: [
                            { name: "Cheddar extra", price: "3.00", order: 0 },
                            { name: "Bacon extra", price: "5.00", order: 1 },
                            { name: "Ovo frito", price: "2.50", order: 2 },
                          ],
                        },
                      },
                    ],
                  },
                },
              ],
            },
          },
          {
            name: "Burgers",
            order: 1,
            products: {
              create: [
                {
                  name: "Smash da Casa",
                  description:
                    "Dois smash burgers de 90g, queijo prato derretido, picles, mostarda e cebola na chapa.",
                  price: "28.90",
                  imageUrl: img("photo-1594212699903-ec8a3eca50f5"),
                  tenantId: "seed_brasa_burger",
                  order: 0,
                  optionGroups: {
                    create: [
                      {
                        name: "Adicionais",
                        minChoices: 0,
                        maxChoices: 3,
                        options: {
                          create: [
                            { name: "Queijo extra", price: "2.50", order: 0 },
                            { name: "Bacon extra", price: "5.00", order: 1 },
                            { name: "Ovo frito", price: "2.50", order: 2 },
                          ],
                        },
                      },
                    ],
                  },
                },
                {
                  name: "Veggie na Brasa",
                  description:
                    "Hambúrguer de grão-de-bico, queijo coalho grelhado, rúcula, tomate confit e maionese de ervas.",
                  price: "32.90",
                  imageUrl: img("photo-1520072959219-c595dc870360"),
                  tenantId: "seed_brasa_burger",
                  order: 1,
                  optionGroups: {
                    create: [
                      {
                        name: "Adicionais",
                        minChoices: 0,
                        maxChoices: 2,
                        options: {
                          create: [
                            { name: "Queijo coalho extra", price: "4.00", order: 0 },
                            { name: "Abacate", price: "3.50", order: 1 },
                            { name: "Cogumelos", price: "4.50", order: 2 },
                          ],
                        },
                      },
                    ],
                  },
                },
              ],
            },
          },
          {
            name: "Acompanhamentos",
            order: 2,
            products: {
              create: [
                {
                  name: "Batata Rústica",
                  description:
                    "Batatas com casca, alecrim, flor de sal e maionese defumada da casa.",
                  price: "19.90",
                  imageUrl: img("photo-1573080496219-bb080dd4f877"),
                  tenantId: "seed_brasa_burger",
                  order: 0,
                  optionGroups: {
                    create: [
                      {
                        name: "Tamanho",
                        minChoices: 1,
                        maxChoices: 1,
                        options: {
                          create: [
                            { name: "Individual", order: 0 },
                            { name: "Para dividir", price: "8.00", order: 1 },
                          ],
                        },
                      },
                      {
                        name: "Molhos extras",
                        minChoices: 0,
                        maxChoices: 2,
                        order: 1,
                        options: {
                          create: [
                            { name: "Maionese defumada", price: "2.00", order: 0 },
                            { name: "Cheddar cremoso", price: "3.00", order: 1 },
                          ],
                        },
                      },
                    ],
                  },
                },
                {
                  name: "Onion Rings",
                  description:
                    "Anéis de cebola empanados na cerveja, crocantes, com molho barbecue.",
                  price: "22.90",
                  imageUrl: img("photo-1639024471283-03518883512d"),
                  tenantId: "seed_brasa_burger",
                  order: 1,
                },
              ],
            },
          },
          {
            name: "Bebidas",
            order: 3,
            products: {
              create: [
                {
                  name: "Limonada da Casa",
                  description: "Feita na hora, com limão siciliano e um toque de hortelã.",
                  price: "11.90",
                  imageUrl: img("photo-1621263764928-df1444c5e859"),
                  tenantId: "seed_brasa_burger",
                  order: 0,
                  optionGroups: {
                    create: [
                      {
                        name: "Sabor",
                        minChoices: 1,
                        maxChoices: 1,
                        options: {
                          create: [
                            { name: "Limão", order: 0 },
                            { name: "Maracujá", order: 1 },
                            { name: "Morango", order: 2 },
                          ],
                        },
                      },
                      {
                        name: "Gelo",
                        minChoices: 0,
                        maxChoices: 1,
                        order: 1,
                        options: {
                          create: [
                            { name: "Com gelo", order: 0 },
                            { name: "Sem gelo", order: 1 },
                          ],
                        },
                      },
                    ],
                  },
                },
                {
                  name: "Coca-Cola Lata",
                  description: "350ml, bem gelada.",
                  price: "7.00",
                  imageUrl: img("photo-1629203851122-3726ecdf080e"),
                  tenantId: "seed_brasa_burger",
                  order: 1,
                },
                {
                  name: "Cerveja Artesanal",
                  description: "IPA local, 355ml, notas cítricas e amargor equilibrado.",
                  price: "18.00",
                  imageUrl: img("photo-1608270586620-248524c67de9"),
                  tenantId: "seed_brasa_burger",
                  order: 2,
                },
              ],
            },
          },
          {
            name: "Sobremesas",
            order: 4,
            products: {
              create: [
                {
                  name: "Brownie com Sorvete",
                  description:
                    "Brownie quente de chocolate 70%, sorvete de baunilha e calda de caramelo.",
                  price: "21.90",
                  imageUrl: img("photo-1606313564200-e75d5e30476c"),
                  tenantId: "seed_brasa_burger",
                  order: 0,
                  optionGroups: {
                    create: [
                      {
                        name: "Sorvete",
                        minChoices: 1,
                        maxChoices: 1,
                        options: {
                          create: [
                            { name: "Baunilha", order: 0 },
                            { name: "Chocolate", order: 1 },
                          ],
                        },
                      },
                    ],
                  },
                },
                {
                  name: "Petit Gateau",
                  description:
                    "Bolo quente de chocolate com recheio cremoso e sorvete de creme.",
                  price: "24.90",
                  imageUrl: img("photo-1578985545062-69928b1d9587"),
                  tenantId: "seed_brasa_burger",
                  order: 1,
                },
              ],
            },
          },
        ],
      },
    },
  });

  console.log("🥗 Criando Verde Vivo...");
  const verde = await prisma.tenant.create({
    data: {
      id: "seed_verde_vivo",
      name: "Verde Vivo",
      slug: "verde-vivo",
      logo: "/brands/verde-vivo.svg",
      tagline: "Comida fresca, leve e cheia de cor, feita todos os dias.",
      primaryColor: "#16a34a",
      phone: "(11) 97777-4321",
      address: "Alameda das Figueiras, 42 — Pinheiros, São Paulo/SP",
      deliveryFee: "5.90",
      isOpen: true,
      printSettings: {
        footerNote: "Comida de verdade, feita com carinho. Até a próxima! 🌿",
        receiptHeader: "Bowls, saladas e sucos naturais",
        showLogo: true,
        paperWidthMm: 80,
      },
      paymentSettings: {
        create: {
          provider: "MANUAL",
          pixEnabled: true,
          cashEnabled: true,
          cardEnabled: false,
          pixKeyType: "EMAIL",
          pixKey: "financeiro@verdevivo.com.br",
          pixHolderName: "VERDE VIVO ALIMENTOS",
          pixCity: "SAO PAULO",
          instructions:
            "PIX da loja: envie o comprovante no WhatsApp (11) 97777-4321. Cartão apenas na entrega.",
        },
      },
      categories: {
        create: [
          {
            name: "Mais pedidos",
            order: 0,
            products: {
              create: [
                {
                  name: "Bowl Tropical",
                  description:
                    "Base de arroz integral, frango grelhado, manga, abacate, tomate e molho de coentro.",
                  price: "32.90",
                  imageUrl: img("photo-1546069901-ba9599a7e63c"),
                  tenantId: "seed_verde_vivo",
                  order: 0,
                  optionGroups: {
                    create: [
                      {
                        name: "Base",
                        minChoices: 1,
                        maxChoices: 1,
                        options: {
                          create: [
                            { name: "Arroz integral", order: 0 },
                            { name: "Quinoa", order: 1 },
                            { name: "Mix de folhas", order: 2 },
                          ],
                        },
                      },
                      {
                        name: "Proteína",
                        minChoices: 1,
                        maxChoices: 1,
                        order: 1,
                        options: {
                          create: [
                            { name: "Frango grelhado", price: "6.00", order: 0 },
                            { name: "Grão-de-bico", order: 1 },
                            { name: "Salmão", price: "10.00", order: 2 },
                          ],
                        },
                      },
                      {
                        name: "Extras",
                        minChoices: 0,
                        maxChoices: 3,
                        order: 2,
                        options: {
                          create: [
                            { name: "Abacate", price: "4.00", order: 0 },
                            { name: "Ovo cozido", price: "3.00", order: 1 },
                            { name: "Sementes", price: "2.00", order: 2 },
                          ],
                        },
                      },
                    ],
                  },
                },
                {
                  name: "Bowl Mediterrâneo",
                  description:
                    "Quinoa, grão-de-bico crocante, pepino, tomate, azeitonas e molho de tahine.",
                  price: "35.90",
                  imageUrl: img("photo-1512621776951-a57141f2eefd"),
                  tenantId: "seed_verde_vivo",
                  order: 1,
                  optionGroups: {
                    create: [
                      {
                        name: "Proteína",
                        minChoices: 1,
                        maxChoices: 1,
                        options: {
                          create: [
                            { name: "Grão-de-bico", order: 0 },
                            { name: "Frango grelhado", price: "6.00", order: 1 },
                            { name: "Salmão", price: "10.00", order: 2 },
                          ],
                        },
                      },
                    ],
                  },
                },
              ],
            },
          },
          {
            name: "Sanduíches",
            order: 1,
            products: {
              create: [
                {
                  name: "Wrap de Frango",
                  description:
                    "Tortilha integral, frango desfiado, cenoura, alface e molho de iogurte.",
                  price: "26.90",
                  imageUrl: img("photo-1626700051175-6818013e1d4f"),
                  tenantId: "seed_verde_vivo",
                  order: 0,
                  optionGroups: {
                    create: [
                      {
                        name: "Molho",
                        minChoices: 0,
                        maxChoices: 1,
                        options: {
                          create: [
                            { name: "Tahine", order: 0 },
                            { name: "Iogurte", order: 1 },
                            { name: "Picante", order: 2 },
                          ],
                        },
                      },
                    ],
                  },
                },
                {
                  name: "Salada Verde",
                  description:
                    "Folhas orgânicas, pepino, tomate cereja, sementes e vinagrete de limão.",
                  price: "24.90",
                  imageUrl: img("photo-1540420773420-3366772f4999"),
                  tenantId: "seed_verde_vivo",
                  order: 1,
                },
              ],
            },
          },
          {
            name: "Sucos",
            order: 2,
            products: {
              create: [
                {
                  name: "Suco Verde",
                  description: "Couve, maçã, limão, gengibre e água de coco.",
                  price: "12.90",
                  imageUrl: img("photo-1610970881699-44a5587cabec"),
                  tenantId: "seed_verde_vivo",
                  order: 0,
                  optionGroups: {
                    create: [
                      {
                        name: "Tamanho",
                        minChoices: 1,
                        maxChoices: 1,
                        options: {
                          create: [
                            { name: "300ml", order: 0 },
                            { name: "500ml", price: "4.00", order: 1 },
                          ],
                        },
                      },
                    ],
                  },
                },
                {
                  name: "Smoothie de Frutas",
                  description: "Morango, banana, iogurte natural e granola.",
                  price: "16.90",
                  imageUrl: img("photo-1505252585461-04db1eb84625"),
                  tenantId: "seed_verde_vivo",
                  order: 1,
                },
              ],
            },
          },
          {
            name: "Doces",
            order: 3,
            products: {
              create: [
                {
                  name: "Açaí 500ml",
                  description:
                    "Açaí cremoso com banana, granola artesanal e mel.",
                  price: "22.90",
                  imageUrl: img("photo-1590301157890-4810ed352733"),
                  tenantId: "seed_verde_vivo",
                  order: 0,
                  optionGroups: {
                    create: [
                      {
                        name: "Complementos",
                        minChoices: 0,
                        maxChoices: 4,
                        options: {
                          create: [
                            { name: "Granola", price: "2.00", order: 0 },
                            { name: "Banana", price: "1.50", order: 1 },
                            { name: "Morango", price: "2.50", order: 2 },
                            { name: "Leite condensado", price: "2.00", order: 3 },
                          ],
                        },
                      },
                    ],
                  },
                },
                {
                  name: "Brownie Fit",
                  description: "Brownie de cacau 100% com castanhas e tâmaras.",
                  price: "14.90",
                  imageUrl: img("photo-1606313564200-e75d5e30476c"),
                  tenantId: "seed_verde_vivo",
                  order: 1,
                },
              ],
            },
          },
        ],
      },
    },
  });

  console.log("🧾 Criando pedidos de exemplo...");

  const brasaOrders: SeedOrder[] = [
    {
      sequence: 42,
      status: "PENDING",
      type: "DELIVERY",
      payment: "PIX",
      customerName: "Marina Souza",
      customerPhone: "(11) 98888-1234",
      address: "Rua Harmonia, 321, apto 12 — Vila Madalena",
      notes: "Entregar na portaria, por favor.",
      minutesAgo: 2,
      items: [
        {
          product: "Brasa Clássico",
          quantity: 1,
          options: ["Ao ponto", "Cheddar extra", "Bacon extra"],
        },
        {
          product: "Batata Rústica",
          quantity: 2,
          options: ["Para dividir", "Maionese defumada"],
        },
        {
          product: "Limonada da Casa",
          quantity: 1,
          options: ["Limão", "Com gelo"],
        },
      ],
    },
    {
      sequence: 41,
      status: "PREPARING",
      type: "TAKEOUT",
      payment: "CARD",
      customerName: "Lucas Prado",
      customerPhone: "(11) 97777-8899",
      minutesAgo: 9,
      items: [
        {
          product: "Duplo Fogo",
          quantity: 2,
          options: ["Ao ponto", "Médio", "Ovo frito"],
        },
        { product: "Coca-Cola Lata", quantity: 1 },
      ],
    },
    {
      sequence: 40,
      status: "READY",
      type: "TABLE",
      payment: "CASH",
      customerName: "Camila Reis",
      customerPhone: "(11) 96666-7788",
      tableNumber: "07",
      changeFor: 150,
      minutesAgo: 18,
      items: [
        {
          product: "Smash da Casa",
          quantity: 1,
          options: ["Queijo extra"],
        },
        { product: "Cerveja Artesanal", quantity: 2 },
        {
          product: "Brownie com Sorvete",
          quantity: 1,
          options: ["Baunilha"],
        },
      ],
    },
    {
      sequence: 39,
      status: "DISPATCHED",
      type: "DELIVERY",
      payment: "PIX",
      customerName: "Rafael Lima",
      customerPhone: "(11) 95555-1122",
      address: "Rua Girassol, 88, casa 4 — Vila Madalena",
      minutesAgo: 35,
      items: [
        {
          product: "Veggie na Brasa",
          quantity: 1,
          options: ["Abacate", "Cogumelos"],
        },
        { product: "Onion Rings", quantity: 1 },
        {
          product: "Limonada da Casa",
          quantity: 2,
          options: ["Maracujá", "Sem gelo"],
        },
      ],
    },
    {
      sequence: 38,
      status: "COMPLETED",
      type: "DELIVERY",
      payment: "CARD",
      customerName: "Ana Beatriz",
      customerPhone: "(11) 94444-3344",
      address: "Rua Fradique Coutinho, 1200, bloco B — Pinheiros",
      minutesAgo: 78,
      completedMinutesAgo: 42,
      items: [
        {
          product: "Brasa Clássico",
          quantity: 1,
          options: ["Bem passado", "Cebola caramelizada"],
        },
        { product: "Batata Rústica", quantity: 1, options: ["Individual"] },
      ],
    },
    {
      sequence: 37,
      status: "COMPLETED",
      type: "TAKEOUT",
      payment: "PIX",
      customerName: "Diego Martins",
      customerPhone: "(11) 93333-5566",
      minutesAgo: 124,
      completedMinutesAgo: 101,
      items: [
        { product: "Duplo Fogo", quantity: 1, options: ["Mal passado", "Explosivo"] },
        { product: "Coca-Cola Lata", quantity: 2 },
      ],
    },
  ];

  for (const order of brasaOrders) {
    await createSeedOrder(brasa.id, 7.9, order);
  }

  const verdeOrders: SeedOrder[] = [
    {
      sequence: 17,
      status: "PENDING",
      type: "DELIVERY",
      payment: "CARD",
      customerName: "Helena Castro",
      customerPhone: "(11) 92222-9090",
      address: "Rua dos Pinheiros, 455, apto 71 — Pinheiros",
      notes: "Sem cebola, por favor.",
      minutesAgo: 4,
      items: [
        {
          product: "Bowl Tropical",
          quantity: 1,
          options: ["Quinoa", "Salmão", "Abacate", "Sementes"],
        },
        { product: "Suco Verde", quantity: 2, options: ["500ml"] },
      ],
    },
    {
      sequence: 16,
      status: "PREPARING",
      type: "TAKEOUT",
      payment: "PIX",
      customerName: "Juliana Alves",
      customerPhone: "(11) 91111-8080",
      minutesAgo: 11,
      items: [
        {
          product: "Wrap de Frango",
          quantity: 1,
          options: ["Iogurte"],
        },
        { product: "Smoothie de Frutas", quantity: 1 },
      ],
    },
    {
      sequence: 15,
      status: "COMPLETED",
      type: "DELIVERY",
      payment: "CASH",
      customerName: "Pedro Nunes",
      customerPhone: "(11) 90000-7070",
      address: "Rua Artur de Azevedo, 70 — Pinheiros",
      changeFor: 100,
      minutesAgo: 70,
      completedMinutesAgo: 38,
      items: [
        {
          product: "Bowl Mediterrâneo",
          quantity: 1,
          options: ["Frango grelhado"],
        },
        {
          product: "Açaí 500ml",
          quantity: 1,
          options: ["Granola", "Banana", "Morango"],
        },
      ],
    },
  ];

  for (const order of verdeOrders) {
    await createSeedOrder(verde.id, 5.9, order);
  }

  await prisma.tenant.update({
    where: { id: brasa.id },
    data: { orderSequence: 42 },
  });
  await prisma.tenant.update({
    where: { id: verde.id },
    data: { orderSequence: 17 },
  });

  console.log("");
  console.log("✅ Seed concluído!");
  console.log("   Cardápio:  http://localhost:3000/brasa-burger");
  console.log("   Cozinha:   http://localhost:3000/admin/brasa-burger");
  console.log("   Verde:     http://localhost:3000/verde-vivo");
  console.log("");
}

main()
  .catch((error) => {
    console.error("❌ Seed falhou:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
