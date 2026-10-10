import {useState} from 'react'
import {NavLink,Outlet,Link,useParams,useNavigate} from 'react-router-dom'
import {ShoppingCart,Repeat,MapPin} from 'lucide-react'
import {motion} from 'framer-motion'
import {useStore,avail,off} from './store'
import {Card,PriceTag,ExplainPanel,Countdown,Counter} from './ui'

const live=ps=>ps.filter(p=>p.status==='published'&&avail(p)>0)

export function CLayout(){
  const cart=useStore(s=>s.cart)

  return(
    <div className="min-h-screen bg-[#fffdf7]">

      <header className="sticky top-0 z-10 bg-white/95 backdrop-blur border-b border-black/5">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center gap-4 flex-wrap">

          <b className="text-forest text-xl">
            🌿 ZeroRot
          </b>

          <nav className="flex gap-4 text-sm flex-1">
            <NavLink end to="/c">
              Home
            </NavLink>

            <NavLink to="/c/deals">
              Browse Deals
            </NavLink>

            <NavLink to="/c/deals?focus=1">
              Search
            </NavLink>
          </nav>

          <Link
            to="/c/cart"
            className="relative p-2"
          >
            <ShoppingCart/>

            <span className="absolute -top-1 -right-1 bg-forest text-white text-[10px] rounded-full px-1.5">
              {cart.length}
            </span>
          </Link>

          <Link
            to="/r"
            className="flex items-center gap-2 bg-forest text-white px-4 py-2 rounded-full text-sm"
          >
            <Repeat size={15}/>
            Switch to Retailer
          </Link>

        </div>
      </header>

      <Outlet/>

    </div>
  )
}


function Cardp({p}){

  return(
    <motion.div
      whileHover={{y:-4}}
      transition={{duration:0.2}}
    >

      <Link
        to={`/c/p/${p.id}`}
        className="block bg-white rounded-2xl overflow-hidden shadow-sm border border-black/5 hover:shadow-md transition-shadow"
      >

        {/* Real product image */}
        <div className="h-44 bg-sage relative overflow-hidden">

          <img
            src={p.image}
            alt={p.name}
            className="w-full h-full object-cover"
          />

          <span className="absolute top-3 left-3 bg-forest text-white text-xs font-semibold px-2.5 py-1 rounded-full">
            {off(p)}% OFF
          </span>

        </div>


        {/* Product information */}
        <div className="p-4">

          <b className="block text-[15px]">
            {p.name}
          </b>

          <div className="mt-1">
            <PriceTag p={p}/>
          </div>

          <p className="text-xs text-black/50 mt-2">
            <MapPin size={11} className="inline"/>
            {' '}
            {p.distanceKm} km · {avail(p)} kg left
          </p>

          <p className="text-xs text-amber-700 mt-2">
            <Countdown to={p.endsAt}/>
          </p>

        </div>

      </Link>

    </motion.div>
  )
}


export function Deals({hero}){

  const ps=useStore(s=>s.products)

  const[q,setQ]=useState('')
  const[c,setC]=useState('All')
  const[sort,setSort]=useState('off')

  const cats=[
    'All',
    ...new Set(ps.map(p=>p.category))
  ]

  const rows=live(ps)
    .filter(
      p=>
        (c==='All'||p.category===c) &&
        p.name.toLowerCase().includes(q.toLowerCase())
    )
    .sort(
      (a,b)=>
        sort==='off'
          ? off(b)-off(a)
          : sort==='price'
            ? a.currentPrice-b.currentPrice
            : a.endsAt-b.endsAt
    )

  return(
    <div className="max-w-6xl mx-auto px-4 py-6">

      {hero&&
        <div className="rounded-3xl bg-forest text-white p-8 md:p-12 mb-6">

          <p className="text-sm text-white/60 mb-2">
            SURPLUS MARKETPLACE
          </p>

          <h1 className="text-4xl md:text-5xl font-bold">
            Save Food. Save Money.
          </h1>

          <p className="mt-3 text-white/70 max-w-xl">
            Fresh surplus food from nearby stores,
            offered at lower prices instead of going to waste.
          </p>

        </div>
      }


      {/* Search and sort */}
      <div className="flex flex-wrap gap-3 mb-4">

        <input
          aria-label="Search deals"
          value={q}
          onChange={e=>setQ(e.target.value)}
          placeholder="Search bananas, bread, paneer…"
          className="flex-1 min-w-48 bg-white rounded-full px-5 py-3 border border-black/10 outline-none focus:border-forest"
        />

        <select
          aria-label="Sort"
          value={sort}
          onChange={e=>setSort(e.target.value)}
          className="bg-white rounded-full px-4 border border-black/10"
        >
          <option value="off">
            Biggest discount
          </option>

          <option value="price">
            Lowest price
          </option>

          <option value="end">
            Ending soon
          </option>

        </select>

      </div>


      {/* Categories */}
      <div className="flex gap-2 mb-5 overflow-x-auto">

        {cats.map(x=>
          <button
            key={x}
            onClick={()=>setC(x)}
            className={`px-4 py-1.5 rounded-full text-sm whitespace-nowrap ${
              c===x
                ? 'bg-forest text-white'
                : 'bg-white border border-black/10'
            }`}
          >
            {x}
          </button>
        )}

      </div>


      {/* Product grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">

        {rows.map(p=>
          <Cardp
            key={p.id}
            p={p}
          />
        )}

      </div>


      {!rows.length&&
        <p className="text-center text-black/40 py-16">
          No live deals right now. Check back soon!
        </p>
      }

    </div>
  )
}


export function Product(){

  const{id}=useParams()

  const p=useStore(
    s=>s.products.find(x=>x.id===+id)
  )

  const add=useStore(s=>s.addCart)

  const nav=useNavigate()

  const[q,setQ]=useState(1)

  if(!p)return null

  const a=avail(p)

  const ok=p.status==='published'&&a>0


  return(
    <div className="max-w-5xl mx-auto px-4 py-8 grid md:grid-cols-2 gap-8">

      {/* Product image */}
      <div className="bg-sage rounded-3xl h-72 md:h-96 overflow-hidden">

        <img
          src={p.image}
          alt={p.name}
          className="w-full h-full object-cover"
        />

      </div>


      {/* Product details */}
      <div className="space-y-4">

        <div>
          <p className="text-xs uppercase tracking-wide text-black/40 mb-1">
            Fresh surplus
          </p>

          <h1 className="text-3xl font-bold">
            {p.name}
          </h1>
        </div>


        <div>
          <PriceTag
            p={p}
            big
          />

          {ok&&
            <span className="ml-3 bg-forest text-white text-sm font-bold px-3 py-1 rounded-full">
              {off(p)}% OFF
            </span>
          }

        </div>


        <p className="text-sm text-black/60">
          <b>{a} kg</b> available · {p.shelfLifeDays} day(s) shelf life · {p.store}, {p.distanceKm} km away
        </p>


        <ExplainPanel
          open
          title="Why is this discounted?"
        >
          <p>
            Excess inventory + short remaining shelf life.
            The food is fresh and safe; we'd rather sell it than waste it.
          </p>

          <p>
            Your purchase directly prevents food waste.
          </p>
        </ExplainPanel>


        {/* Quantity */}
        <div className="flex items-center gap-3">

          <button
            aria-label="Less"
            onClick={()=>setQ(Math.max(1,q-1))}
            className="w-9 h-9 rounded-full bg-sage"
          >
            −
          </button>

          <b>
            {q} kg
          </b>

          <button
            aria-label="More"
            onClick={()=>setQ(Math.min(a,q+1))}
            className="w-9 h-9 rounded-full bg-sage"
          >
            +
          </button>

        </div>


        <button
          disabled={!ok}
          onClick={()=>{
            add(p.id,q)
            useStore.getState().say(
              `${q} kg ${p.name} added`
            )
            nav('/c/cart')
          }}
          className="w-full bg-forest text-white rounded-full py-3 font-semibold disabled:opacity-40"
        >
          Reserve · ₹{q*p.currentPrice}
        </button>

      </div>

    </div>
  )
}


export function Cart(){

  const{
    cart,
    products,
    rmCart,
    reserve
  }=useStore()

  const[slot,setSlot]=useState('5:00 – 6:00 PM')

  const[done,setDone]=useState(null)


  if(done)

    return(
      <div className="max-w-xl mx-auto px-4 py-12 text-center">

        <motion.div
          initial={{scale:0}}
          animate={{scale:1}}
          className="text-7xl"
        >
          ✅
        </motion.div>

        <h1 className="text-3xl font-bold mt-4">
          Reservation confirmed
        </h1>

        <p className="text-black/60">
          ID <b>{done.id}</b> · Status: Ready for pickup {done.slot}
        </p>

        <Card className="mt-6">

          <p className="text-forest font-semibold">
            You've helped prevent food waste.
          </p>

          <p className="text-3xl font-bold my-2">
            <Counter
              to={done.kg}
              suf=" kg saved"
            />
          </p>

          <p>
            You saved ₹
            <Counter to={done.save}/>
            {' '}
            · Total paid ₹{done.total}
          </p>

        </Card>

        <Link
          to="/c/deals"
          className="inline-block mt-6 text-forest underline"
        >
          Keep browsing
        </Link>

      </div>
    )


  const L=cart.map(
    c=>({
      ...c,
      p:products.find(x=>x.id===c.id)
    })
  )

  const total=L.reduce(
    (a,l)=>a+l.qty*l.p.currentPrice,
    0
  )

  const save=L.reduce(
    (a,l)=>a+l.qty*(l.p.basePrice-l.p.currentPrice),
    0
  )


  return(
    <div className="max-w-3xl mx-auto px-4 py-8">

      <h1 className="text-2xl font-bold mb-4">
        Your reservation
      </h1>


      {!L.length&&
        <p className="text-black/40 py-10 text-center">
          Your cart is empty.{' '}
          <Link
            className="underline"
            to="/c/deals"
          >
            Find a deal
          </Link>
        </p>
      }


      {/* Cart items */}
      {L.map(l=>
        <Card
          key={l.id}
          className="flex items-center justify-between gap-4 mb-3"
        >

          <span className="flex items-center gap-3">

            <img
              src={l.p.image}
              alt={l.p.name}
              className="w-12 h-12 rounded-lg object-cover"
            />

            <span>
              {l.p.name} · {l.qty} kg × ₹{l.p.currentPrice}
            </span>

          </span>


          <span className="whitespace-nowrap">

            <b>
              ₹{l.qty*l.p.currentPrice}
            </b>

            <button
              aria-label="Remove"
              onClick={()=>rmCart(l.id)}
              className="text-red-600 ml-2"
            >
              ✕
            </button>

          </span>

        </Card>
      )}


      {!!L.length&&
        <Card className="space-y-3">

          <p className="text-sm">
            📍 Pickup: GreenMart, Sector 18 (1.2 km)
          </p>

          <select
            aria-label="Pickup slot"
            value={slot}
            onChange={e=>setSlot(e.target.value)}
            className="border border-black/10 rounded-lg px-3 py-2 w-full"
          >
            {[
              '12:00 – 1:00 PM',
              '5:00 – 6:00 PM',
              '7:00 – 8:00 PM'
            ].map(s=>
              <option key={s}>
                {s}
              </option>
            )}
          </select>

          <p className="text-forest font-semibold">
            Total savings ₹{save}
          </p>

          <p className="text-2xl font-bold">
            Total ₹{total}
          </p>

          <button
            onClick={()=>setDone(reserve(slot))}
            className="w-full bg-forest text-white rounded-full py-3 font-semibold"
          >
            Confirm Reservation
          </button>

        </Card>
      }

    </div>
  )
}