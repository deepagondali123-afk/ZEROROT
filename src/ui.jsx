import {useState,useEffect} from 'react'
import {motion} from 'framer-motion'
import {ChevronDown,ChevronRight,Clock} from 'lucide-react'

export const Card=({children,className=''})=>
  <div className={`bg-white rounded-xl border border-black/[0.07] shadow-[0_1px_3px_rgba(0,0,0,0.04)] p-5 ${className}`}>
    {children}
  </div>

const B={
  safe:{
    label:'Safe',
    dot:'bg-emerald-500',
    style:'bg-emerald-50 text-emerald-700 border-emerald-100'
  },
  watch:{
    label:'Watch',
    dot:'bg-amber-500',
    style:'bg-amber-50 text-amber-700 border-amber-100'
  },
  risk:{
    label:'At Risk',
    dot:'bg-red-500',
    style:'bg-red-50 text-red-700 border-red-100'
  }
}

export const StatusBadge=({level})=>{
  const b=B[level]||B.safe

  return(
    <span className={`inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full border ${b.style}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${b.dot}`}/>
      {b.label}
    </span>
  )
}

export const useCount=(to,ms=900)=>{
  const[v,s]=useState(0)

  useEffect(()=>{
    let f,t0

    const step=t=>{
      t0??=t
      const k=Math.min(1,(t-t0)/ms)
      s(Math.round(to*k))

      if(k<1) f=requestAnimationFrame(step)
    }

    f=requestAnimationFrame(step)

    return()=>cancelAnimationFrame(f)
  },[to])

  return v
}

export const Counter=({to,pre='',suf=''})=>{
  const v=useCount(to)

  return(
    <>
      {pre}
      {v.toLocaleString('en-IN')}
      {suf}
    </>
  )
}

export const Kpi=({
  label,
  value,
  pre,
  suf,
  tone=''
})=>
  <motion.div
    whileHover={{y:-2}}
    transition={{duration:0.15}}
  >
    <Card className="h-full">
      <p className="text-xs font-medium uppercase tracking-wide text-black/45">
        {label}
      </p>

      <p className={`text-2xl font-semibold mt-2 ${tone}`}>
        <Counter
          to={value}
          pre={pre}
          suf={suf}
        />
      </p>
    </Card>
  </motion.div>

export const PriceTag=({p,big})=>
  <span className="inline-flex items-baseline gap-2">
    <b className={big?'text-3xl font-semibold text-forest':'text-lg font-semibold text-forest'}>
      ₹{p.currentPrice}/kg
    </b>

    {p.currentPrice<p.basePrice&&
      <s className="text-sm text-black/35">
        ₹{p.basePrice}
      </s>
    }
  </span>

export const ExplainPanel=({
  title,
  children,
  open:o=false
})=>{
  const[open,set]=useState(o)

  return(
    <div className="rounded-xl border border-forest/10 bg-sage/35 overflow-hidden">

      <button
        className="flex items-center gap-2 w-full text-left px-4 py-3 text-sm font-semibold text-forest"
        aria-expanded={open}
        onClick={()=>set(!open)}
      >
        {open
          ? <ChevronDown size={16}/>
          : <ChevronRight size={16}/>
        }

        {title}
      </button>

      {open&&
        <div className="px-4 pb-4 text-sm text-black/65 leading-relaxed space-y-2">
          {children}
        </div>
      }

    </div>
  )
}

export const Countdown=({to})=>{
  const[n,s]=useState(Date.now())

  useEffect(()=>{
    const i=setInterval(
      ()=>s(Date.now()),
      1000
    )

    return()=>clearInterval(i)
  },[])

  const d=Math.max(0,to-n)
  const h=Math.floor(d/36e5)
  const m=Math.floor(d%36e5/6e4)
  const sc=Math.floor(d%6e4/1e3)

  return(
    <span className="inline-flex items-center gap-1 tabular-nums">
      <Clock size={12}/>

      {h>=48
        ? `${Math.floor(h/24)}d left`
        : `${h}h ${m}m ${sc}s`
      }
    </span>
  )
}