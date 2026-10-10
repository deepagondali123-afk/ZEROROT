import {create} from 'zustand'
import {persist} from 'zustand/middleware'

const raw=[
  ['Bananas','Fruits','/products/bananas.jpg',500,2,45,'declining',220,1.2],
  ['Alphonso Mangoes','Fruits','/products/mangoes.jpg',180,3,120,'stable',40,2.4],
  ['Tomatoes','Vegetables','/products/tomatoes.jpg',320,3,32,'declining',90,1.8],
  ['Spinach','Vegetables','/products/spinach.jpg',90,1,28,'declining',45,1.2],
  ['Capsicum','Vegetables','/products/capsicum.jpg',140,4,60,'stable',0,1.2],
  ['Whole Wheat Bread','Bakery','/products/bread.jpg',120,1,45,'declining',60,0.8],
  ['Croissants','Bakery','/products/croissants.jpg',60,1,70,'declining',30,0.8],
  ['Greek Yogurt','Dairy','/products/yogurt.jpg',150,4,90,'high',0,2.1],
  ['Paneer','Dairy','/products/panner.jpg',80,2,320,'stable',25,2.1],
  ['Basmati Rice','Packaged','/products/rice.jpg',600,90,110,'stable',0,3],
  ['Corn Flakes','Packaged','/products/cornflakes.jpeg',200,5,180,'declining',35,3]
]

const now=Date.now()

const mk=(r,i)=>{
  const[
    name,
    category,
    image,
    stockKg,
    life,
    price,
    trend,
    excessKg,
    distanceKm
  ]=r

  const score=Math.max(
    0,
    Math.min(
      99,
      Math.round(
        excessKg/stockKg*50+
        Math.max(0,5-life)*9+
        (trend==='declining'?15:trend==='high'?-10:0)
      )
    )
  )

  const pct=
    (life<=2?15:life<=4?10:5)+
    (trend==='declining'&&life>2?5:0)

  return{
    id:i+1,
    name,
    category,
    image,
    stockKg,
    shelfLifeDays:life,
    basePrice:price,
    currentPrice:price,
    demandTrend:trend,
    riskScore:score,
    riskLevel:score>=55?'risk':score>=30?'watch':'safe',
    excessKg,
    recommendedMarkdownPct:pct,
    recommendedPrice:Math.round(price*(1-pct/100)),
    store:'GreenMart',
    distanceKm,
    status:excessKg?'surplus':'inventory',
    reservedKg:0,
    offer:null,
    endsAt:now+life*864e5
  }
}

const products=raw.map(mk)

products.forEach(p=>{
  p.status='published'
  p.currentPrice=p.recommendedPrice
})

export const avail=p=>
  Math.max(0,p.excessKg-p.reservedKg)

export const off=p=>
  Math.round((1-p.currentPrice/p.basePrice)*100)

export const buyers=[
  {
    name:'Spice Route Kitchens',
    type:'Restaurant',
    km:1.4,
    kg:80
  },
  {
    name:'CloudChef Hub',
    type:'Cloud kitchen',
    km:2.2,
    kg:120
  },
  {
    name:'Royal Caterers',
    type:'Caterer',
    km:3.1,
    kg:150
  },
  {
    name:'Roti Bank NGO',
    type:'NGO',
    km:4.0,
    kg:200
  }
]
export const recoveryPartners = [
  {
    id: 1,
    name: 'GreenCycle Composting',
    type: 'Composting',
    distanceKm: 2.5,
    acceptedWaste: ['Fruits', 'Vegetables', 'Bakery']
  },
  {
    id: 2,
    name: 'BioFuel Energy Hub',
    type: 'Biogas',
    distanceKm: 4.2,
    acceptedWaste: ['Fruits', 'Vegetables']
  },
  {
    id: 3,
    name: 'Circular Organics',
    type: 'Organic Waste Processing',
    distanceKm: 3.1,
    acceptedWaste: ['Fruits', 'Vegetables', 'Bakery', 'Dairy', 'Packaged']
  }
]


export const history={
  monthly:[
    'May',
    'Jun',
    'Jul',
    'Aug',
    'Sep',
    'Oct'
  ].map((m,i)=>({
    m,
    saved:120+i*45+(i%2)*30,
    rev:3800+i*1500
  })),

  weekly:[
    'W1',
    'W2',
    'W3',
    'W4',
    'W5',
    'W6'
  ].map((m,i)=>({
    m,
    saved:30+i*14,
    rev:900+i*420
  }))
}

let t

export const useStore=create(
  persist(
    (set,get)=>({

  products,

  cart:[],

   reservations:[],

  // Recovery & Credits
  recoveryListings:[],

  recoveryCredits:0,

  recoveryCreditsEarned:0,

  recoveryCreditsRedeemed:0,

  proMonthlyPrice:499,

  toast:null,

  impact:{
    saved:1240,
    rev:48600,
    co2:3100,
    sold:312,
    redistributed:410
  },

  /* ---------------- TOAST ---------------- */

  say:m=>{
    clearTimeout(t)

    set({
      toast:m
    })

    t=setTimeout(
      ()=>set({toast:null}),
      2800
    )
  },

  /* ---------------- UPDATE PRODUCT ---------------- */

  upd:(id,f)=>
    set(s=>({
      products:s.products.map(
        p=>p.id===id
          ? {...p,...f(p)}
          : p
      )
    })),

  /* ---------------- ADD PRODUCT ---------------- */

  addProduct:data=>{

    const state=get()

    const nextId=
      state.products.length
        ? Math.max(...state.products.map(p=>p.id))+1
        : 1

    const stock=Number(data.stockKg)||0
    const shelfLife=Number(data.shelfLifeDays)||1
    const price=Number(data.basePrice)||0
    const excess=Number(data.excessKg)||0

    const trend=data.demandTrend || 'stable'

    const score=Math.max(
      0,
      Math.min(
        99,
        Math.round(
          (stock>0 ? excess/stock*50 : 0)+
          Math.max(0,5-shelfLife)*9+
          (trend==='declining'
            ?15
            :trend==='high'
              ?-10
              :0)
        )
      )
    )

    const markdown=
      (shelfLife<=2
        ?15
        :shelfLife<=4
          ?10
          :5)+
      (trend==='declining' && shelfLife>2
        ?5
        :0)

    const product={
      id:nextId,

      name:data.name.trim(),

      category:data.category,

      image:data.image || '/products/placeholder.jpg',

      stockKg:stock,

      shelfLifeDays:shelfLife,

      basePrice:price,

      currentPrice:
        Math.round(
          price*(1-markdown/100)
        ),

      demandTrend:trend,

      riskScore:score,

      riskLevel:
        score>=55
          ?'risk'
          :score>=30
            ?'watch'
            :'safe',

      excessKg:excess,

      recommendedMarkdownPct:markdown,

      recommendedPrice:
        Math.round(
          price*(1-markdown/100)
        ),

      store:'GreenMart',

      distanceKm:0,

      status:'published',

      reservedKg:0,

      offer:null,

      endsAt:
        Date.now()+shelfLife*864e5,

      /* Extra retailer information */

      dateReceived:data.dateReceived || '',

      storageCondition:
        data.storageCondition || 'Normal',

      stockReason:
        data.stockReason || 'Regular inventory',

      qualityStatus:
        data.qualityStatus || 'Not analysed',

      qualityConfidence:
        data.qualityConfidence ?? null
    }

    set(s=>({
      products:[
        ...s.products,
        product
      ]
    }))

    get().say(
      `${product.name} added to inventory`
    )

    return product
  },

  /* ---------------- PUBLISH ---------------- */

  publish:(id,pct)=>{

    const p=
      get().products.find(
        x=>x.id===id
      )

    if(!p)return

    get().upd(
      id,
      p=>({
        status:'published',

        currentPrice:
          Math.round(
            p.basePrice*
            (1-pct/100)
          )
      })
    )

    get().say(
      `${p.name} published at ${pct}% off`
    )
  },

  /* ---------------- BUSINESS OFFER ---------------- */

  offerBiz:id=>{

    get().upd(
      id,
      ()=>({
        offer:
          'Offer sent to 4 nearby buyers'
      })
    )

    get().say(
      'Offer sent to nearby businesses'
    )
  },

  /* ---------------- REDISTRIBUTE ---------------- */

  redistribute:id=>{

    const p=
      get().products.find(
        x=>x.id===id
      )

    if(!p)return

    const q=avail(p)

    get().upd(
      id,
      p=>({
        excessKg:p.reservedKg,
        status:'sold-out'
      })
    )

    set(s=>({
      impact:{
        ...s.impact,

        saved:s.impact.saved+q,

        redistributed:
          s.impact.redistributed+q,

        co2:
          s.impact.co2+q*2.5
      }
    }))

    get().say(
      `${q} kg redistributed to NGO`
    )
  },

  /* ---------------- CART ---------------- */

  addCart:(id,q)=>
    set(s=>({

      cart:s.cart.find(
        c=>c.id===id
      )
        ?s.cart.map(
          c=>c.id===id
            ?{
              ...c,
              qty:c.qty+q
            }
            :c
        )

        :[
          ...s.cart,
          {
            id,
            qty:q
          }
        ]
    })),

  rmCart:id=>
    set(s=>({
      cart:s.cart.filter(
        c=>c.id!==id
      )
    })),

  /* ---------------- RESERVATION ---------------- */

  reserve:slot=>{

    const{
      cart,
      products,
      impact
    }=get()

    let total=0
    let save=0
    let kg=0

    const items=cart.map(c=>{

      const p=
        products.find(
          x=>x.id===c.id
        )

      total+=
        p.currentPrice*c.qty

      save+=
        (p.basePrice-p.currentPrice)*
        c.qty

      kg+=c.qty

      return{
        ...c,
        name:p.name,
        price:p.currentPrice
      }
    })

    set(s=>({

      products:s.products.map(p=>{

        const c=
          cart.find(
            x=>x.id===p.id
          )

        return c
          ?{
            ...p,
            reservedKg:
              p.reservedKg+c.qty
          }
          :p
      }),

      cart:[],

      impact:{
        ...impact,

        saved:
          impact.saved+kg,

        rev:
          impact.rev+total,

        co2:
          impact.co2+kg*2.5,

        sold:
          impact.sold+items.length
      }
    }))

    const r={
      id:
        'ZR-'+
        Math.floor(
          10000+
          Math.random()*89999
        ),

      items,

      total,

      save,

      kg,

      slot
    }

    set(s=>({
      reservations:[
        r,
        ...s.reservations
      ]
    }))

    return r
  },
    /* ---------------- ORGANIC RECOVERY ---------------- */

  listRecoveryWaste: data => {
    const state = get()

    const quantity = Number(data.quantityKg)

    if (!quantity || quantity <= 0) {
      get().say('Enter a valid waste quantity')
      return
    }

    const listing = {
      id: Date.now(),
      wasteType: data.wasteType,
      quantityKg: quantity,
      condition: data.condition || 'Organic waste',
      partnerId: Number(data.partnerId),
      status: 'Listed',
      credits: 0,
      createdAt: new Date().toISOString()
    }

    set(s => ({
      recoveryListings: [
        listing,
        ...s.recoveryListings
      ]
    }))

    get().say('Organic waste listed successfully')
  },

  verifyRecovery: id => {
    const listing = get().recoveryListings.find(
      item => item.id === id
    )

    if (!listing || listing.status !== 'Listed') {
      get().say('This recovery listing is already processed')
      return
    }

    // Demo rate: 10 credits per verified kg
    const credits = Math.round(listing.quantityKg * 10)

    set(s => ({
      recoveryListings: s.recoveryListings.map(item =>
        item.id === id
          ? {
              ...item,
              status: 'Recovered',
              credits
            }
          : item
      ),

      recoveryCredits: s.recoveryCredits + credits,

      recoveryCreditsEarned:
        s.recoveryCreditsEarned + credits
    }))

    get().say(`${credits} recovery credits earned`)
  },

  redeemRecoveryCredits: () => {
    const state = get()
    const balance = state.recoveryCredits

    if (balance <= 0) {
      get().say('No recovery credits available')
      return
    }

    const maxRedeemable = Math.max(
      0,
      state.proMonthlyPrice -
        (state.proMonthlyPrice - balance)
    )

    const redeem = Math.min(
      balance,
      maxRedeemable,
      state.proMonthlyPrice
    )

    if (redeem <= 0) {
      get().say('No credits available to redeem')
      return
    }

    set(s => ({
      recoveryCredits: s.recoveryCredits - redeem,

      recoveryCreditsRedeemed:
        s.recoveryCreditsRedeemed + redeem
    }))

    get().say(`₹${redeem} worth of credits applied to your demo Pro bill`)
  },
  

    }),
    {
      name:'zerorot-store',
      partialize: (state) => ({
  products: state.products,
  cart: state.cart,
  reservations: state.reservations,
  impact: state.impact,

  recoveryListings: state.recoveryListings,
  recoveryCredits: state.recoveryCredits,
  recoveryCreditsEarned: state.recoveryCreditsEarned,
  recoveryCreditsRedeemed: state.recoveryCreditsRedeemed
})
    }
  )
)