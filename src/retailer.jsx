import { recoveryPartners } from './store'
import {useState,useRef,useEffect} from 'react'
import {NavLink,Outlet,Link} from 'react-router-dom'
import {AreaChart,Area,BarChart,Bar,XAxis,YAxis,Tooltip,ResponsiveContainer,CartesianGrid} from 'recharts'
import {LayoutDashboard,Boxes,Brain,Tag,Share2,Leaf,Bell,Repeat} from 'lucide-react'
import {useStore,avail,buyers,history} from './store'
import {Card,Kpi,StatusBadge,PriceTag,ExplainPanel,Counter} from './ui'

const nav=[
  ['', 'Dashboard', LayoutDashboard],
  ['inventory', 'Inventory & Freshness', Boxes],
  ['insights', 'AI Demand & Risk', Brain],
  ['pricing', 'Smart Pricing', Tag],
  ['surplus', 'Surplus Management', Share2],
  ['recovery', 'Recovery & Credits', Leaf],
  ['impact', 'Impact & Reports', Leaf]
]

export function RLayout(){const ps=useStore(s=>s.products),[bell,setBell]=useState(false)
const alerts=ps.filter(p=>p.shelfLifeDays<=2&&avail(p)>0)
return<div className="md:flex min-h-screen"><aside className="md:w-64 bg-forest text-white p-3 md:p-5 flex md:flex-col gap-1 overflow-x-auto md:sticky md:top-0 md:h-screen"><h1 className="text-xl font-bold md:mb-6 mr-3 whitespace-nowrap">🌿 ZeroRot</h1>
{nav.map(([to,l,I])=><NavLink key={to} end={!to} to={to} className={({isActive})=>`flex items-center gap-2 px-3 py-2 rounded-xl whitespace-nowrap text-sm ${isActive?'bg-white/20':'hover:bg-white/10'}`}><I size={18}/>{l}</NavLink>)}</aside>
<main className="flex-1 p-4 md:p-8 max-w-6xl"><header className="flex justify-between items-center mb-6"><span className="text-sm text-black/50">GreenMart · Retailer view</span><div className="flex gap-3 items-center relative">
<button aria-label="Notifications" onClick={()=>setBell(!bell)} className="relative p-2 bg-white rounded-full shadow-sm"><Bell size={18}/><span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] rounded-full px-1.5">{alerts.length}</span></button>
{bell&&<div className="absolute right-0 top-11 w-72 bg-white shadow-xl rounded-xl p-3 z-20 text-sm space-y-2">{alerts.map(p=><p key={p.id}>🔴 {p.name}: {p.shelfLifeDays}d shelf life, {avail(p)} kg unsold</p>)}</div>}
<Link to="/c" className="flex items-center gap-2 bg-forest text-white px-4 py-2 rounded-full text-sm"><Repeat size={15}/>Switch to Customer</Link></div></header><Outlet/></main></div>}
const H=({t,s})=><div className="mb-5"><h2 className="text-2xl font-bold">{t}</h2><p className="text-black/50 text-sm">{s}</p></div>
const dem=p=>[...Array(7)].map((_,i)=>({d:'D'+(i+1),v:Math.round(100*(p.demandTrend==='declining'?1-i*.07:p.demandTrend==='high'?1+i*.06:1+Math.sin(i)*.04))}))
export function Dashboard(){
  const ps=useStore(s=>s.products)
  const im=useStore(s=>s.impact)

  const risk=ps
    .filter(p=>p.riskLevel==='risk')
    .reduce((a,p)=>a+avail(p),0)

  const sur=ps.reduce((a,p)=>a+avail(p),0)

  const pot=ps.reduce(
    (a,p)=>a+avail(p)*p.recommendedPrice,
    0
  )

  const top=[...ps]
    .sort((a,b)=>b.riskScore-a.riskScore)
    .slice(0,3)

  return(
    <>
      <H
        t="Good morning 👋"
        s="Today's food-waste picture at a glance"
      />

      <Card className="bg-forest text-white mb-5">
        <p className="text-lg md:text-2xl font-semibold">
          {risk} kg at risk · {sur} kg surplus · ₹
          {pot.toLocaleString('en-IN')} potential recovery
        </p>
      </Card>

      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-5">

        <Kpi
          label="Total inventory (kg)"
          value={ps.reduce((a,p)=>a+p.stockKg,0)}
        />

        <Kpi
          tone="text-red-600"
          label="At-risk (kg)"
          value={risk}
        />

        <Kpi
          tone="text-amber-600"
          label="Surplus (kg)"
          value={sur}
        />

        <Kpi
          label="Revenue recovered"
          pre="₹"
          value={im.rev}
        />

        <Kpi
          label="Food saved (kg)"
          value={im.saved}
        />

      </div>

      <div className="grid lg:grid-cols-2 gap-4">

        {/* Demand Chart */}
        <Card>
          <h3 className="font-semibold mb-3">
            Demand trend · Bananas
          </h3>

          <ResponsiveContainer height={200}>
            <AreaChart data={dem(ps[0])}>
              <XAxis dataKey="d"/>
              <YAxis/>
              <Tooltip/>
              <Area
                dataKey="v"
                stroke="#1f4d36"
                fill="#dfe9d8"
              />
            </AreaChart>
          </ResponsiveContainer>
        </Card>

        {/* AI Recommendations */}
        <Card>
          <h3 className="font-semibold mb-3">
            AI recommendations
          </h3>

          {top.map(p=>(
            <div
              key={p.id}
              className="py-3 border-b border-black/5"
            >

              <div className="flex items-center gap-3">

                <img
                  src={p.image}
                  alt={p.name}
                  className="w-11 h-11 rounded-lg object-cover bg-sage"
                />

                <div className="flex-1">
                  <p className="text-sm">
                    <b>{p.name}</b>
                  </p>

                  <p className="text-sm text-black/60">
                    Mark down {p.recommendedMarkdownPct}%
                    {' '}→ recover ≈ ₹
                    {(avail(p)*p.recommendedPrice)
                      .toLocaleString('en-IN')}
                  </p>
                </div>

                <StatusBadge level={p.riskLevel}/>

              </div>

            </div>
          ))}

          <div className="flex gap-2 mt-4">

            <Link
              className="bg-forest text-white px-4 py-2 rounded-full text-sm"
              to="pricing"
            >
              Apply markdowns
            </Link>

            <Link
              className="bg-sage px-4 py-2 rounded-full text-sm"
              to="surplus"
            >
              Manage surplus
            </Link>

          </div>

        </Card>

      </div>
    </>
  )
}
export function Inventory(){
  const ps=useStore(s=>s.products)
  const addProduct=useStore(s=>s.addProduct)

  const [q,setQ]=useState('')
  const [r,setR]=useState('all')
  const [open,setOpen]=useState(false)

  // Camera states
  const [cameraOpen,setCameraOpen]=useState(false)
  const [cameraError,setCameraError]=useState('')
  const [capturedImage,setCapturedImage]=useState('')
  const [quality,setQuality]=useState(null)
  const [pricingStep,setPricingStep]=useState(false)
  const videoRef=useRef(null)
  const canvasRef=useRef(null)
  const streamRef=useRef(null)

  const [form,setForm]=useState({
    name:'',
    category:'Fruits',
    stockKg:'',
    basePrice:'',
    shelfLifeDays:'',
    dateReceived:'',
    storageCondition:'Normal',
    demandTrend:'stable',
    excessKg:'',
    stockReason:'Regular inventory'
  })

  const rows=ps.filter(p=>
    p.name.toLowerCase().includes(q.toLowerCase()) &&
    (r==='all'||p.riskLevel===r)
  )

  const change=e=>{
    setForm({...form,[e.target.name]:e.target.value})
  }

  // ---------------- CAMERA ----------------

  const startCamera=async()=>{
    setCameraError('')
    setCapturedImage('')
    setQuality(null)

    if(!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia){
      setCameraError('Camera is not supported by this browser.')
      return
    }

    try{
      const stream=await navigator.mediaDevices.getUserMedia({
        video:{
          facingMode:'environment',
          width:{ideal:1280},
          height:{ideal:720}
        },
        audio:false
      })

      streamRef.current=stream
      setCameraOpen(true)

      setTimeout(()=>{
        if(videoRef.current){
          videoRef.current.srcObject=stream
        }
      },100)

    }catch(err){
      console.error(err)
      setCameraError(
        'Camera permission was denied or the camera is already being used.'
      )
    }
  }

  const stopCamera=()=>{
    if(streamRef.current){
      streamRef.current.getTracks().forEach(track=>track.stop())
      streamRef.current=null
    }

    if(videoRef.current){
      videoRef.current.srcObject=null
    }

    setCameraOpen(false)
  }

  useEffect(()=>{
    return()=>{
      if(streamRef.current){
        streamRef.current.getTracks().forEach(track=>track.stop())
      }
    }
  },[])
const handleUpload = async e => {
  const file = e.target.files?.[0]

  if (!file) return
  setPricingStep(false)

  if (!file.type.startsWith('image/')) {
    alert('Please select an image file.')
    return
  }

  const reader = new FileReader()

  reader.onload = () => {
    setCapturedImage(reader.result)
  }

  reader.readAsDataURL(file)

  try {
    const formData = new FormData()

    formData.append('file', file)
    formData.append('shelf_life_days', form.shelfLifeDays || 3)
    formData.append('demand_trend', form.demandTrend || 'stable')
    formData.append('stock_kg', form.stockKg || 100)
    formData.append('excess_kg', form.excessKg || 20)
    formData.append('base_price', form.basePrice || 100)

    const response = await fetch(
      'http://127.0.0.1:8000/analyze',
      {
        method: 'POST',
        body: formData
      }
    )

    if (!response.ok) {
      throw new Error('ML analysis failed')
    }

    const result = await response.json()

    setQuality({
      freshness: result.freshness_score,
      damage: `${result.rotten_probability}% rotten`,
      quality: result.quality,
      recommendation: result.status,
      markdown: result.recommended_markdown,
      recommendedPrice: result.recommended_price
    })

  } catch (error) {
    console.error(error)
    alert('Could not connect to the ML backend. Make sure FastAPI is running.')
  }
}
const capturePhoto = async () => {
  const video = videoRef.current
  const canvas = canvasRef.current

  if (!video || !canvas) return
  setPricingStep(false)

  canvas.width = video.videoWidth || 1280
  canvas.height = video.videoHeight || 720

  const ctx = canvas.getContext('2d')

  ctx.drawImage(
    video,
    0,
    0,
    canvas.width,
    canvas.height
  )

  const image = canvas.toDataURL('image/jpeg', 0.88)

  setCapturedImage(image)

  stopCamera()

  try {
    const blob = await fetch(image).then(res => res.blob())

    const file = new File(
      [blob],
      'camera-product.jpg',
      { type: 'image/jpeg' }
    )

    const formData = new FormData()

    formData.append('file', file)
    formData.append('shelf_life_days', form.shelfLifeDays || 3)
    formData.append('demand_trend', form.demandTrend || 'stable')
    formData.append('stock_kg', form.stockKg || 100)
    formData.append('excess_kg', form.excessKg || 20)
    formData.append('base_price', form.basePrice || 100)

    const response = await fetch(
      'http://127.0.0.1:8000/analyze',
      {
        method: 'POST',
        body: formData
      }
    )

    if (!response.ok) {
      throw new Error('ML analysis failed')
    }

    const result = await response.json()

    setQuality({
      freshness: result.freshness_score,
      damage: `${result.rotten_probability}% rotten`,
      quality: result.quality,
      recommendation: result.status,
      markdown: result.recommended_markdown,
      recommendedPrice: result.recommended_price
    })

  } catch (error) {
    console.error(error)
    alert('Could not connect to the ML backend. Make sure FastAPI is running.')
  }
}

  const retake=()=>{
  setCapturedImage('')
  setQuality(null)
  setPricingStep(false)
  startCamera()
}

  const useImage=()=>{
    setCameraOpen(false)
  }

  // ---------------- ADD PRODUCT ----------------

  const submit=e=>{
    e.preventDefault()

    if(
      !form.name.trim() ||
      !form.stockKg ||
      !form.basePrice ||
      !form.shelfLifeDays
    ){
      alert('Please fill all required fields.')
      return
    }

    if(!capturedImage){
      alert('Please capture or upload a product image first.')
      return
    }

    addProduct({
      ...form,
      image:capturedImage,
      qualityStatus:quality?.quality || 'Analysed',
      qualityConfidence:quality?.freshness || null
    })

    setForm({
      name:'',
      category:'Fruits',
      stockKg:'',
      basePrice:'',
      shelfLifeDays:'',
      dateReceived:'',
      storageCondition:'Normal',
      demandTrend:'stable',
      excessKg:'',
      stockReason:'Regular inventory'
    })

    setCapturedImage('')
    setQuality(null)
    setOpen(false)
  }

  const closeModal=()=>{
  stopCamera()
  setCapturedImage('')
  setQuality(null)
  setPricingStep(false)
  setCameraError('')
  setOpen(false)
}

  return(
    <>
      {/* HEADER */}
      <div className="flex flex-wrap justify-between items-start gap-3 mb-5">
        <H
          t="Inventory & Freshness"
          s="Search, filter and spot near-expiry stock"
        />

        <button
          onClick={()=>setOpen(true)}
          className="bg-forest text-white px-5 py-2.5 rounded-full font-semibold text-sm hover:opacity-90"
        >
          + Add Product
        </button>
      </div>

      {/* SEARCH + FILTER */}
      <div className="flex flex-wrap gap-3 mb-4">
        <input
          value={q}
          onChange={e=>setQ(e.target.value)}
          placeholder="Search products..."
          className="flex-1 min-w-[220px] bg-white border border-black/10 rounded-xl px-4 py-3 outline-none focus:border-forest"
        />

        <select
          value={r}
          onChange={e=>setR(e.target.value)}
          className="bg-white border border-black/10 rounded-xl px-4 py-3 outline-none"
        >
          <option value="all">All risk</option>
          <option value="safe">Safe</option>
          <option value="watch">Watch</option>
          <option value="risk">At risk</option>
        </select>
      </div>

      {/* INVENTORY TABLE */}
      <Card className="overflow-x-auto p-0">
        <table className="w-full text-sm min-w-[850px]">
          <thead className="bg-sage/50">
            <tr className="text-left">
              <th className="p-3 font-semibold">Product</th>
              <th className="p-3 font-semibold">Stock</th>
              <th className="p-3 font-semibold">Freshness</th>
              <th className="p-3 font-semibold">Price</th>
              <th className="p-3 font-semibold">Demand</th>
              <th className="p-3 font-semibold">Risk</th>
            </tr>
          </thead>

          <tbody>
            {rows.map(p=>(
              <tr
                key={p.id}
                className="border-t border-black/5 hover:bg-sage/20"
              >
                <td className="p-3">
                  <div className="flex items-center gap-3">
                    <img
                      src={p.image}
                      alt={p.name}
                      className="w-12 h-12 rounded-xl object-cover bg-sage"
                    />

                    <div>
                      <p className="font-medium">{p.name}</p>
                      <p className="text-xs text-black/40">
                        {p.category}
                      </p>
                    </div>
                  </div>
                </td>

                <td className="p-3">
                  <b>{p.stockKg} kg</b>
                </td>

                <td className="p-3">
                  <span className={
                    p.shelfLifeDays<=2
                      ? 'text-red-600 font-semibold'
                      : p.shelfLifeDays<=4
                        ? 'text-amber-600 font-semibold'
                        : 'text-forest font-semibold'
                  }>
                    {p.shelfLifeDays}d left
                  </span>
                </td>

                <td className="p-3">
                  ₹{p.currentPrice}/kg
                </td>

                <td className="p-3 capitalize">
                  {p.demandTrend}
                </td>

                <td className="p-3">
                  <StatusBadge level={p.riskLevel}/>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {!rows.length&&(
          <p className="text-center py-10 text-black/40">
            No products match your search.
          </p>
        )}
      </Card>

      {/* ================= ADD PRODUCT MODAL ================= */}

      {open&&(
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">

          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[92vh] overflow-y-auto">

            {/* MODAL HEADER */}
            <div className="sticky top-0 bg-white border-b border-black/5 px-6 py-4 flex justify-between items-center z-20">

              <div>
                <h2 className="text-xl font-bold text-forest">
                  Add New Product
                </h2>

                <p className="text-sm text-black/50">
                  Add stock details and scan product quality
                </p>
              </div>

              <button
                onClick={closeModal}
                className="w-9 h-9 rounded-full bg-sage flex items-center justify-center text-lg hover:bg-sage/70"
              >
                ×
              </button>

            </div>

            {/* FORM */}
            <form onSubmit={submit} className="p-6 space-y-6">

              {/* BASIC INFORMATION */}
              <div>

                <h3 className="font-semibold text-forest mb-3">
                  Basic Information
                </h3>

                <div className="grid md:grid-cols-2 gap-4">

                  <div className="md:col-span-2">

                    <label className="text-sm font-medium">
                      Product Name *
                    </label>

                    <input
                      name="name"
                      value={form.name}
                      onChange={change}
                      placeholder="e.g. Fresh Apples"
                      className="w-full mt-1 border border-black/10 rounded-xl px-4 py-3 outline-none focus:border-forest"
                    />

                  </div>

                  <div>

                    <label className="text-sm font-medium">
                      Category *
                    </label>

                    <select
                      name="category"
                      value={form.category}
                      onChange={change}
                      className="w-full mt-1 border border-black/10 rounded-xl px-4 py-3 bg-white"
                    >
                      <option>Fruits</option>
                      <option>Vegetables</option>
                      <option>Bakery</option>
                      <option>Dairy</option>
                      <option>Packaged</option>
                      <option>Beverages</option>
                      <option>Other</option>
                    </select>

                  </div>

                  <div>

                    <label className="text-sm font-medium">
                      Current Stock (kg) *
                    </label>

                    <input
                      type="number"
                      min="0"
                      name="stockKg"
                      value={form.stockKg}
                      onChange={change}
                      placeholder="e.g. 100"
                      className="w-full mt-1 border border-black/10 rounded-xl px-4 py-3 outline-none"
                    />

                  </div>

                  <div>

                    <label className="text-sm font-medium">
                      Base Selling Price (₹/kg) *
                    </label>

                    <input
                      type="number"
                      min="0"
                      name="basePrice"
                      value={form.basePrice}
                      onChange={change}
                      placeholder="e.g. 120"
                      className="w-full mt-1 border border-black/10 rounded-xl px-4 py-3 outline-none"
                    />

                  </div>

                  <div>

                    <label className="text-sm font-medium">
                      Shelf Life Remaining (days) *
                    </label>

                    <input
                      type="number"
                      min="1"
                      name="shelfLifeDays"
                      value={form.shelfLifeDays}
                      onChange={change}
                      placeholder="e.g. 4"
                      className="w-full mt-1 border border-black/10 rounded-xl px-4 py-3 outline-none"
                    />

                  </div>

                </div>

              </div>

              {/* STOCK DETAILS */}
              <div>

                <h3 className="font-semibold text-forest mb-3">
                  Stock Details
                </h3>

                <div className="grid md:grid-cols-2 gap-4">

                  <div>

                    <label className="text-sm font-medium">
                      Date Received
                    </label>

                    <input
                      type="date"
                      name="dateReceived"
                      value={form.dateReceived}
                      onChange={change}
                      className="w-full mt-1 border border-black/10 rounded-xl px-4 py-3 outline-none"
                    />

                  </div>

                  <div>

                    <label className="text-sm font-medium">
                      Expected Excess (kg)
                    </label>

                    <input
                      type="number"
                      min="0"
                      name="excessKg"
                      value={form.excessKg}
                      onChange={change}
                      placeholder="e.g. 25"
                      className="w-full mt-1 border border-black/10 rounded-xl px-4 py-3 outline-none"
                    />

                  </div>

                  <div>

                    <label className="text-sm font-medium">
                      Storage Condition
                    </label>

                    <select
                      name="storageCondition"
                      value={form.storageCondition}
                      onChange={change}
                      className="w-full mt-1 border border-black/10 rounded-xl px-4 py-3 bg-white"
                    >
                      <option>Normal</option>
                      <option>Refrigerated</option>
                      <option>Frozen</option>
                    </select>

                  </div>

                  <div>

                    <label className="text-sm font-medium">
                      Demand Level
                    </label>

                    <select
                      name="demandTrend"
                      value={form.demandTrend}
                      onChange={change}
                      className="w-full mt-1 border border-black/10 rounded-xl px-4 py-3 bg-white"
                    >
                      <option value="low">Low</option>
                      <option value="stable">Medium</option>
                      <option value="high">High</option>
                    </select>

                  </div>

                  <div className="md:col-span-2">

                    <label className="text-sm font-medium">
                      Reason for Adding Stock
                    </label>

                    <select
                      name="stockReason"
                      value={form.stockReason}
                      onChange={change}
                      className="w-full mt-1 border border-black/10 rounded-xl px-4 py-3 bg-white"
                    >
                      <option>Regular inventory</option>
                      <option>Overstock</option>
                      <option>Near expiry</option>
                      <option>Customer return</option>
                      <option>Other</option>
                    </select>

                  </div>

                </div>

              </div>

              {/* ================= QUALITY SCAN ================= */}

<div>

  <div className="mb-3">

    <h3 className="font-semibold text-forest">
      📷 Product Quality Scan
    </h3>

    <p className="text-xs text-black/50 mt-1">
      Product image is required for quality analysis
    </p>

  </div>

  {/* CAMERA + UPLOAD OPTIONS */}

  {!capturedImage && !cameraOpen && (
    <div className="grid md:grid-cols-2 gap-3">

      {/* CAMERA */}

      <button
        type="button"
        onClick={startCamera}
        className="border-2 border-dashed border-forest/30 hover:border-forest rounded-2xl p-6 text-center bg-sage/30 transition"
      >

        <div className="text-4xl mb-2">
          📷
        </div>

        <p className="font-semibold text-forest">
          Capture with Camera
        </p>

        <p className="text-xs text-black/50 mt-1">
          Take a fresh product photo
        </p>

      </button>


      {/* UPLOAD */}

      <label
        className="border-2 border-dashed border-forest/30 hover:border-forest rounded-2xl p-6 text-center bg-sage/30 transition cursor-pointer"
      >

        <div className="text-4xl mb-2">
          📁
        </div>

        <p className="font-semibold text-forest">
          Upload Image
        </p>

        <p className="text-xs text-black/50 mt-1">
          Choose an image from your device
        </p>

        <input
          type="file"
          accept="image/*"
          onChange={handleUpload}
          className="hidden"
        />

      </label>

    </div>
  )}


  {/* CAMERA VIEW */}

  {cameraOpen && (
    <div className="bg-black rounded-2xl overflow-hidden">

      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        className="w-full aspect-video object-cover"
      />

      <div className="p-3 flex justify-center gap-3">

        <button
          type="button"
          onClick={capturePhoto}
          className="bg-white text-forest px-6 py-2.5 rounded-full font-bold"
        >
          ● Capture
        </button>

        <button
          type="button"
          onClick={stopCamera}
          className="bg-white/20 text-white px-5 py-2.5 rounded-full"
        >
          Cancel
        </button>

      </div>

    </div>
  )}


  {/* CAMERA ERROR */}

  {cameraError && (
    <div className="mt-3 bg-red-50 text-red-700 border border-red-200 rounded-xl p-3 text-sm">
      {cameraError}
    </div>
  )}


  {/* HIDDEN CANVAS */}

  <canvas
    ref={canvasRef}
    className="hidden"
  />


  {/* IMAGE PREVIEW + QUALITY */}

  {capturedImage && (
    <div className="mt-4">

      <div className="grid md:grid-cols-2 gap-4">

        {/* IMAGE */}

        <div className="rounded-2xl overflow-hidden bg-black">

          <img
            src={capturedImage}
            alt="Product preview"
            className="w-full aspect-video object-cover"
          />

        </div>


        {/* QUALITY RESULT */}

{quality && (
  <div className="space-y-4">

    {/* STEP 1 — QUALITY ANALYSIS */}

    <div className="rounded-2xl bg-sage/50 p-4">

      <div className="flex items-center justify-between mb-4">

        <div>
          <p className="font-semibold text-forest">
            Step 1 · AI Quality Analysis
          </p>

          <p className="text-xs text-black/50">
            Freshness and visual quality prediction
          </p>
        </div>

        <span className="text-xs bg-white px-3 py-1 rounded-full">
          AI Model
        </span>

      </div>

      <div className="space-y-3 text-sm">

        <div className="flex justify-between">
          <span>Freshness</span>
          <b>{quality.freshness}%</b>
        </div>

        <div className="w-full h-2 bg-white rounded-full overflow-hidden">
          <div
            className="h-full bg-forest"
            style={{
              width: `${quality.freshness}%`
            }}
          />
        </div>

        <div className="flex justify-between">
          <span>Visible damage</span>
          <b>{quality.damage}</b>
        </div>

        <div className="flex justify-between">
          <span>Overall quality</span>

          <b className="text-forest">
            {quality.quality}
          </b>
        </div>

        <div className="bg-white rounded-xl p-3">

          <p className="text-xs text-black/50">
            Recommendation
          </p>

          <p className="font-semibold mt-1">
            {quality.recommendation}
          </p>

        </div>

      </div>

    </div>


    {/* MOVE TO STEP 2 */}

    {!pricingStep && (

      <button
        type="button"
        onClick={() => setPricingStep(true)}
        className="w-full bg-forest text-white rounded-xl py-3 font-semibold hover:opacity-90"
      >
        Continue to Dynamic Pricing →
      </button>

    )}


    {/* STEP 2 — DYNAMIC PRICING */}

    {pricingStep && (

      <div className="rounded-2xl border border-forest/10 bg-white p-5 shadow-sm">

        <div className="flex items-center justify-between mb-4">

          <div>
            <p className="font-semibold text-forest">
              Step 2 · Dynamic Pricing
            </p>

            <p className="text-xs text-black/50">
              XGBoost pricing recommendation
            </p>
          </div>

          <span className="text-xs bg-sage text-forest px-3 py-1 rounded-full font-semibold">
            XGBoost
          </span>

        </div>


        {/* INPUTS */}

        <div className="grid grid-cols-2 gap-3 text-sm mb-4">

          <div className="bg-sage/40 rounded-xl p-3">
            <p className="text-xs text-black/50">
              Base Price
            </p>

            <p className="font-semibold mt-1">
              ₹{form.basePrice || 0}/kg
            </p>
          </div>


          <div className="bg-sage/40 rounded-xl p-3">
            <p className="text-xs text-black/50">
              Freshness
            </p>

            <p className="font-semibold mt-1">
              {quality.freshness}%
            </p>
          </div>


          <div className="bg-sage/40 rounded-xl p-3">
            <p className="text-xs text-black/50">
              Shelf Life
            </p>

            <p className="font-semibold mt-1">
              {form.shelfLifeDays || 0} days
            </p>
          </div>


          <div className="bg-sage/40 rounded-xl p-3">
            <p className="text-xs text-black/50">
              Demand
            </p>

            <p className="font-semibold mt-1 capitalize">
              {form.demandTrend}
            </p>
          </div>


          <div className="bg-sage/40 rounded-xl p-3 col-span-2">
            <p className="text-xs text-black/50">
              Excess Stock
            </p>

            <p className="font-semibold mt-1">
              {form.excessKg || 0} kg
            </p>
          </div>

        </div>


        {/* XGBOOST RESULT */}

        <div className="bg-forest text-white rounded-2xl p-5">

          <p className="text-sm text-white/70">
            AI Recommended Markdown
          </p>

          <p className="text-3xl font-bold mt-1">
            {quality.markdown}%
          </p>


          <div className="border-t border-white/20 my-4" />


          <p className="text-sm text-white/70">
            Recommended Selling Price
          </p>

          <p className="text-4xl font-bold mt-1">
            ₹{quality.recommendedPrice}/kg
          </p>


          <p className="text-xs text-white/60 mt-2">
            Original price: ₹{form.basePrice}/kg
          </p>

        </div>


        {/* CONTINUE */}

        <button
          type="button"
          className="w-full mt-4 bg-sage text-forest rounded-xl py-3 font-semibold"
        >
          Apply Price & Continue →
        </button>

      </div>

    )}

  </div>
)}

      </div>


      {/* IMAGE ACTIONS */}

      <div className="flex gap-2 mt-3">

        <button
          type="button"
          onClick={() => {
            setCapturedImage('')
            setQuality(null)
          }}
          className="bg-sage px-4 py-2 rounded-full text-sm font-semibold"
        >
          ↻ Choose Another
        </button>


        <button
          type="button"
          onClick={retake}
          className="bg-sage px-4 py-2 rounded-full text-sm font-semibold"
        >
          📷 Retake
        </button>

      </div>

    </div>
  )}

</div>
               
              {/* ACTIONS */}
              <div className="flex justify-end gap-3 pt-2 border-t border-black/5">

                <button
                  type="button"
                  onClick={closeModal}
                  className="px-5 py-2.5 rounded-full bg-sage font-medium"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-full bg-forest text-white font-semibold disabled:opacity-40"
                  disabled={!capturedImage}
                >
                  Add Product
                </button>

              </div>

            </form>

          </div>

        </div>
      )}
    </>
  )
}
export function Insights(){
  const ps=useStore(s=>s.products)

  return(
    <>
      <H
        t="AI Demand & Risk Insights"
        s="Every score comes with the reasons behind it"
      />

      <div className="grid md:grid-cols-2 gap-4">
        {ps.map(p=>{
          const ex=Math.round(p.excessKg/p.stockKg*100)

          const rec=
            ex>=25
              ? ['Order Less',`Order ${ex}% less next cycle`]
              : p.demandTrend==='high'
                ? ['Order More','Order 15% more next cycle']
                : ['Stable','Keep reorder quantity unchanged']

          return(
            <Card key={p.id}>

              {/* Product image + name */}
              <div className="flex justify-between items-start gap-3">

                <div className="flex items-center gap-3">
                  <img
                    src={p.image}
                    alt={p.name}
                    className="w-14 h-14 rounded-xl object-cover bg-sage"
                  />

                  <div>
                    <b className="block">{p.name}</b>
                    <span className="text-xs text-black/40">
                      {p.category}
                    </span>
                  </div>
                </div>

                <StatusBadge level={p.riskLevel}/>
              </div>

              <p className="text-sm mt-3">
                Risk score <b>{p.riskScore}/100</b>
                {' · '}
                predicted surplus <b>{p.excessKg} kg</b>
              </p>

              <ul className="text-sm text-black/60 list-disc ml-5 my-2">
                <li>{p.stockKg} kg in stock</li>
                <li>{p.excessKg} kg expected excess ({ex}%)</li>
                <li>{p.shelfLifeDays} day(s) shelf life left</li>
                <li>Demand {p.demandTrend}</li>
              </ul>

              <div className="h-14">
                <ResponsiveContainer>
                  <AreaChart data={dem(p)}>
                    <Area
                      dataKey="v"
                      stroke="#5b8a4a"
                      fill="#dfe9d8"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>

              <p className="mt-2 bg-sage rounded-lg px-3 py-2 text-sm">
                <b>{rec[0]}:</b> {rec[1]}
                {' '}
                (suggested reorder {Math.round(p.stockKg-p.excessKg)} kg)
              </p>

            </Card>
          )
        })}
      </div>
    </>
  )
}
export function Pricing(){
  const ps=useStore(s=>s.products).filter(p=>p.excessKg>0)
  const publish=useStore(s=>s.publish)
  const[id,setId]=useState(1)
  const p=ps.find(x=>x.id===id)||ps[0]
  const[pct,setPct]=useState(p.recommendedMarkdownPct)

  const price=Math.round(p.basePrice*(1-pct/100))
  const a=avail(p)

  const pick=x=>{
    setId(x.id)
    setPct(x.recommendedMarkdownPct)
  }

  return(
    <>
      <H
        t="Smart Pricing & Markdown"
        s="Drag to see price and recovery update live"
      />

      <div className="grid lg:grid-cols-3 gap-4">

        {/* Product list */}
        <div className="space-y-2">
          {ps.map(x=>(
            <button
              key={x.id}
              onClick={()=>pick(x)}
              className={`w-full text-left rounded-xl px-4 py-3 border ${
                x.id===p.id
                  ? 'bg-forest text-white'
                  : 'bg-white border-black/5'
              }`}
            >
              <div className="flex items-center gap-3">

                <img
                  src={x.image}
                  alt={x.name}
                  className="w-10 h-10 rounded-lg object-cover bg-sage"
                />

                <span className="flex-1">
                  {x.name}
                </span>

                <span className="text-xs">
                  {avail(x)} kg
                </span>

              </div>
            </button>
          ))}
        </div>

        {/* Pricing details */}
        <Card className="lg:col-span-2">

          <div className="flex items-center gap-4">

            <img
              src={p.image}
              alt={p.name}
              className="w-20 h-20 rounded-2xl object-cover bg-sage"
            />

            <div>
              <h3 className="text-xl font-bold">{p.name}</h3>

              <p className="text-sm text-black/50">
                {a} kg excess · {p.shelfLifeDays}d shelf life · demand {p.demandTrend}
              </p>
            </div>

          </div>

          <div className="flex items-end gap-6 my-5">

            <div>
              <p className="text-sm text-black/50">Current</p>
              <b className="text-2xl line-through text-black/40">
                ₹{p.basePrice}
              </b>
            </div>

            <div>
              <p className="text-sm text-black/50">New price</p>
              <b className="text-5xl text-forest">
                ₹{price}
              </b>
            </div>

            <div className="ml-auto text-right">
              <p className="text-sm text-black/50">
                Expected recovery
              </p>
              <b className="text-2xl">
                ₹{(a*price).toLocaleString('en-IN')}
              </b>
            </div>

          </div>

          <label className="text-sm">
            Markdown: <b>{pct}%</b>
            {' '}
            (AI recommends {p.recommendedMarkdownPct}%)
          </label>

          <input
            type="range"
            min="0"
            max="60"
            value={pct}
            onChange={e=>setPct(+e.target.value)}
            className="w-full accent-[#1f4d36]"
          />

          <div className="flex gap-2 text-xs my-3">
            {[10,20,30,40].map(x=>(
              <button
                key={x}
                onClick={()=>setPct(x)}
                className="bg-sage rounded-full px-3 py-1"
              >
                ₹{Math.round(p.basePrice*(1-x/100))} (-{x}%)
              </button>
            ))}
          </div>

          <ExplainPanel title="Why this price?">
            <p>
              {p.shelfLifeDays} day(s) left means unsold stock turns to waste.
            </p>

            <p>
              {a} kg excess against {p.stockKg} kg stock with {p.demandTrend} demand.
            </p>

            <p>
              A {p.recommendedMarkdownPct}% cut keeps margin while clearing stock before expiry.
            </p>
          </ExplainPanel>

          <button
            onClick={()=>publish(p.id,pct)}
            className="mt-4 bg-forest text-white rounded-full px-6 py-3 font-semibold"
          >
            Apply & Publish Markdown
          </button>

        </Card>

      </div>
    </>
  )
}

const getDistributionRecommendations = p => {
  const available = avail(p)

  if (!available) {
    return []
  }

  const recommendations = []

  // Restaurant / business score
  let restaurantScore = 0

  if (available >= 50) restaurantScore += 35
  else if (available >= 20) restaurantScore += 20
  else restaurantScore += 10

  if (p.shelfLifeDays <= 2) restaurantScore += 30
  else if (p.shelfLifeDays <= 4) restaurantScore += 20

  if (p.demandTrend === 'declining') restaurantScore += 20
  else if (p.demandTrend === 'stable') restaurantScore += 10

  restaurantScore += 15

  // Customer score
  let customerScore = 0

  if (p.currentPrice < p.basePrice) customerScore += 30

  if (p.demandTrend === 'high') customerScore += 30
  else if (p.demandTrend === 'stable') customerScore += 20
  else customerScore += 10

  if (p.shelfLifeDays >= 3) customerScore += 20
  else customerScore += 10

  if (available < 50) customerScore += 20
  else customerScore += 10

  // NGO score
  let ngoScore = 0

  if (p.shelfLifeDays <= 2) ngoScore += 40

  if (p.riskLevel === 'risk') ngoScore += 30

  if (p.demandTrend === 'declining') ngoScore += 20

  ngoScore += 10

  // Decide quantities
  const restaurantQty = Math.min(
    available,
    Math.max(20, Math.round(available * 0.55))
  )

  const customerQty = Math.min(
    available - restaurantQty,
    Math.max(10, Math.round(available * 0.30))
  )

  const ngoQty = Math.max(
    0,
    available - restaurantQty - customerQty
  )

  recommendations.push({
    channel: 'Restaurant / Business',
    icon: '🍽️',
    score: restaurantScore,
    quantity: restaurantQty,
    reason:
      available >= 50
        ? 'High surplus can be cleared faster through bulk buyers.'
        : 'Nearby businesses can absorb surplus quickly.',
    action: 'Send Offers'
  })

  recommendations.push({
    channel: 'Customers',
    icon: '🛒',
    score: customerScore,
    quantity: customerQty,
    reason:
      p.currentPrice < p.basePrice
        ? 'Discounted price can attract price-sensitive customers.'
        : 'Marketplace helps reach more individual buyers.',
    action: 'Publish Deal'
  })

  recommendations.push({
    channel: 'NGO / Redistribution',
    icon: '❤️',
    score: ngoScore,
    quantity: ngoQty,
    reason:
      p.shelfLifeDays <= 2
        ? 'Urgent fallback to prevent near-expiry stock from becoming waste.'
        : 'Backup channel for stock that remains unsold.',
    action: 'Redistribute'
  })

  return recommendations
    .filter(x => x.quantity > 0)
    .sort((a, b) => b.score - a.score)
}
const steps=['At Risk','Surplus','Marketplace','Buyer']
export function Surplus(){
  const ps=useStore(s=>s.products).filter(p=>p.excessKg>0)
  const recommendations = ps.map(p => ({
  product: p,
  plans: getDistributionRecommendations(p)
}))
  const{offerBiz,redistribute}=useStore()

  return(
    <>
      <H
        t="Surplus Management"
        s="Route every kilo to someone who needs it"
      />

      <div className="space-y-4">
        {ps.map(p=>(
          <Card key={p.id}>

            <div className="flex flex-wrap justify-between gap-3">

              <div className="flex items-center gap-3">
                <img
                  src={p.image}
                  alt={p.name}
                  className="w-14 h-14 rounded-xl object-cover bg-sage"
                />

                <div>
                  <b className="block">{p.name}</b>
                  <span className="text-xs text-black/40">
                    {p.category}
                  </span>
                </div>
              </div>

              <StatusBadge level={p.riskLevel}/>

            </div>

            <p className="text-sm mt-3">
              <b className="text-xl">
                <Counter to={avail(p)} suf=" kg"/>
              </b>
              {' '}available · {p.reservedKg} kg reserved · {p.shelfLifeDays}d left · <PriceTag p={p}/> · {p.status}
            </p>

            <div className="flex gap-1 text-xs my-3 flex-wrap">
              {steps.map((s,i)=>(
                <span
                  key={s}
                  className={`px-3 py-1 rounded-full ${
                    i<=(p.status==='published'?3:1)
                      ? 'bg-forest text-white'
                      : 'bg-sage'
                  }`}
                >
                  {s}
                  {i<3&&' →'}
                </span>
              ))}
            </div>

            <p className="text-xs text-black/50">
              Matches: {buyers.slice(0,3).map(b=>`${b.name} (${b.type}, ${b.km} km)`).join(' · ')}
              {p.offer&&
                <b className="text-forest">
                  {' · '}{p.offer}
                </b>
              }
            </p>
              <div className="mt-5 rounded-2xl border border-forest/10 bg-sage/30 p-4">

  <div className="flex items-center justify-between gap-3 mb-4">
    <div>
      <p className="font-bold text-forest">
        🤖 AI Smart Distribution Plan
      </p>

      <p className="text-xs text-black/50">
        Recommended channels based on stock, shelf life, demand and price
      </p>
    </div>

    <span className="text-xs font-semibold bg-white px-3 py-1 rounded-full">
      {avail(p)} kg
    </span>
  </div>

  <div className="space-y-3">

    {getDistributionRecommendations(p).map(r => (

      <div
        key={r.channel}
        className="bg-white rounded-xl p-3 border border-black/5"
      >

        <div className="flex items-center justify-between gap-3">

          <div className="flex items-center gap-2">

            <span className="text-xl">
              {r.icon}
            </span>

            <div>
              <p className="font-semibold">
                {r.channel}
              </p>

              <p className="text-xs text-black/50">
                {r.quantity} kg recommended
              </p>
            </div>

          </div>

          <span className="text-xs font-bold text-forest bg-sage px-2.5 py-1 rounded-full">
            Score {r.score}
          </span>

        </div>

        <p className="text-xs text-black/60 mt-2">
          {r.reason}
        </p>

        <button
          className="mt-2 text-xs font-semibold text-forest hover:underline"
          onClick={() => {

            if (r.channel === 'Restaurant / Business') {
              offerBiz(p.id)
            }

            if (r.channel === 'Customers') {
              useStore.getState().publish(
                p.id,
                p.recommendedMarkdownPct
              )
            }

            if (r.channel === 'NGO / Redistribution') {
              redistribute(p.id)
            }

          }}
        >
          {r.action} →
        </button>

      </div>

    ))}

  </div>

</div>
            <div className="flex flex-wrap gap-2 mt-3 text-sm">

              <button
                disabled={!avail(p)}
                onClick={()=>useStore.getState().publish(p.id,p.recommendedMarkdownPct)}
                className="bg-forest text-white rounded-full px-4 py-2 disabled:opacity-40"
              >
                Sell on Marketplace
              </button>

              <button
                onClick={()=>offerBiz(p.id)}
                className="bg-sage rounded-full px-4 py-2"
              >
                Offer to Nearby Businesses
              </button>

              <button
                disabled={!avail(p)}
                onClick={()=>redistribute(p.id)}
                className="bg-sage rounded-full px-4 py-2 disabled:opacity-40"
              >
                Redistribute
              </button>

            </div>

          </Card>
        ))}
      </div>
    </>
  )
}
export function Impact(){
  const im=useStore(s=>s.impact)
  const[w,setW]=useState('monthly')
  const ps=useStore(s=>s.products)

  return(
    <>
      <H
        t="Impact & Reports"
        s="Proof that surplus is becoming value"
      />

      <div className="grid sm:grid-cols-3 gap-4 mb-4">

        <Kpi
          label="Food saved"
          value={im.saved}
          suf=" kg"
        />

        <Kpi
          label="Revenue recovered"
          pre="₹"
          value={im.rev}
        />

        <Kpi
          label="CO₂e avoided"
          value={Math.round(im.co2)}
          suf=" kg"
        />

      </div>

      <div className="grid sm:grid-cols-2 gap-4 mb-4">

        <Kpi
          label="Discounted products sold"
          value={im.sold}
        />

        <Kpi
          label="Surplus redistributed (kg)"
          value={im.redistributed}
        />

      </div>

      <Card>

        <div className="flex justify-between mb-3">

          <h3 className="font-semibold">
            Waste reduction & recovery
          </h3>

          <div className="text-sm">
            {['weekly','monthly'].map(x=>(
              <button
                key={x}
                onClick={()=>setW(x)}
                className={`px-3 py-1 rounded-full ${
                  w===x
                    ? 'bg-forest text-white'
                    : ''
                }`}
              >
                {x}
              </button>
            ))}
          </div>

        </div>

        <ResponsiveContainer height={250}>
          <BarChart data={history[w]}>
            <CartesianGrid
              strokeDasharray="3 3"
              vertical={false}
            />

            <XAxis dataKey="m"/>
            <YAxis/>
            <Tooltip/>

            <Bar
              dataKey="saved"
              name="kg saved"
              fill="#1f4d36"
              radius={6}
            />

            <Bar
              dataKey="rev"
              name="₹ recovered"
              fill="#a9c49a"
              radius={6}
            />

          </BarChart>
        </ResponsiveContainer>

      </Card>

      <Card className="mt-4">

        <h3 className="font-semibold mb-3">
          Product-wise reserved
        </h3>

        {ps
          .filter(p=>p.reservedKg)
          .map(p=>(
            <div
              key={p.id}
              className="flex items-center gap-3 py-2 border-b border-black/5"
            >

              <img
                src={p.image}
                alt={p.name}
                className="w-11 h-11 rounded-lg object-cover bg-sage"
              />

              <div className="flex-1">
                <p className="text-sm font-medium">
                  {p.name}
                </p>

                <p className="text-xs text-black/50">
                  {p.reservedKg} kg reserved
                </p>
              </div>

              <p className="text-sm font-semibold">
                ₹{(p.reservedKg*p.currentPrice)
                  .toLocaleString('en-IN')}
              </p>

            </div>
          ))
        }

        {!ps.some(p=>p.reservedKg)&&(
          <p className="text-sm text-black/40">
            No reservations yet. Switch to the customer view to place one.
          </p>
        )}

      </Card>
    </>
  )
}

export function Recovery() {
  const listings = useStore(s => s.recoveryListings)
  const credits = useStore(s => s.recoveryCredits)
  const earned = useStore(s => s.recoveryCreditsEarned)
  const redeemed = useStore(s => s.recoveryCreditsRedeemed)
  const price = useStore(s => s.proMonthlyPrice)
  const listWaste = useStore(s => s.listRecoveryWaste)
  const verify = useStore(s => s.verifyRecovery)
  const redeem = useStore(s => s.redeemRecoveryCredits)

  const [wasteType, setWasteType] = useState('Fruits')
  const [quantity, setQuantity] = useState('')
  const [condition, setCondition] = useState('Unsuitable for sale')
  const [partnerId, setPartnerId] = useState(String(recoveryPartners[0].id))

  const recoveredKg = listings
    .filter(item => item.status === 'Recovered')
    .reduce((sum, item) => sum + item.quantityKg, 0)

  const billDue = Math.max(0, price - Math.min(credits, price))

  const submitWaste = e => {
    e.preventDefault()

    listWaste({
      wasteType,
      quantityKg: quantity,
      condition,
      partnerId
    })

    setQuantity('')
  }

  return (
    <div className="space-y-5">
      <H
        t="Recovery & Credits ♻️"
        s="Recover value from organic waste and make your Pro plan more affordable."
      />

      <div className="rounded-2xl bg-forest text-white p-6">
        <p className="text-sm text-white/70">Available Recovery Credits</p>
        <h2 className="text-4xl font-bold mt-2">{credits}</h2>
        <p className="text-sm mt-2">
          Credits are earned after recovery is marked verified in this demo.
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card>
          <p className="text-sm text-black/50">Credits earned</p>
          <h3 className="text-2xl font-bold">{earned}</h3>
        </Card>
        <Card>
          <p className="text-sm text-black/50">Credits redeemed</p>
          <h3 className="text-2xl font-bold">{redeemed}</h3>
        </Card>
        <Card>
          <p className="text-sm text-black/50">Waste recovered</p>
          <h3 className="text-2xl font-bold">{recoveredKg} kg</h3>
        </Card>
        <Card>
          <p className="text-sm text-black/50">Demo Pro bill due</p>
          <h3 className="text-2xl font-bold">₹{billDue}</h3>
          <p className="text-xs text-black/50">Before any new redemption</p>
        </Card>
      </div>

      <Card>
        <h3 className="text-lg font-bold mb-1">List organic waste</h3>
        <p className="text-sm text-black/50 mb-4">
          List waste that is unsuitable for sale and appropriate for recovery.
          Keep edible surplus separate for food rescue.
        </p>

        <form onSubmit={submitWaste} className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium">Waste type</label>
              <select
                value={wasteType}
                onChange={e => setWasteType(e.target.value)}
                className="w-full mt-1 border rounded-xl p-3 bg-white"
              >
                {['Fruits', 'Vegetables', 'Bakery', 'Dairy', 'Packaged'].map(type => (
                  <option key={type}>{type}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-sm font-medium">Quantity (kg)</label>
              <input
                type="number"
                min="0.1"
                step="0.1"
                required
                value={quantity}
                onChange={e => setQuantity(e.target.value)}
                placeholder="e.g. 12"
                className="w-full mt-1 border rounded-xl p-3"
              />
            </div>

            <div>
              <label className="text-sm font-medium">Condition</label>
              <select
                value={condition}
                onChange={e => setCondition(e.target.value)}
                className="w-full mt-1 border rounded-xl p-3 bg-white"
              >
                <option>Unsuitable for sale</option>
                <option>Expired or spoiled</option>
                <option>Preparation scraps</option>
              </select>
            </div>

            <div>
              <label className="text-sm font-medium">Recovery partner</label>
              <select
                value={partnerId}
                onChange={e => setPartnerId(e.target.value)}
                className="w-full mt-1 border rounded-xl p-3 bg-white"
              >
                {recoveryPartners
                  .filter(partner => partner.acceptedWaste.includes(wasteType))
                  .map(partner => (
                    <option key={partner.id} value={partner.id}>
                      {partner.name} · {partner.distanceKm} km
                    </option>
                  ))}
              </select>
            </div>
          </div>

          <button
            type="submit"
            className="bg-forest text-white rounded-full px-5 py-3 font-semibold"
          >
            + List Waste
          </button>
        </form>
      </Card>

      <Card>
        <div className="flex flex-wrap justify-between gap-2 items-center mb-4">
          <div>
            <h3 className="text-lg font-bold">Pro subscription</h3>
            <p className="text-sm text-black/50">
              Illustrative monthly price: ₹{price}
            </p>
          </div>
          <button
            onClick={redeem}
            disabled={credits <= 0}
            className="bg-forest text-white rounded-full px-5 py-3 font-semibold disabled:opacity-40"
          >
            Apply Credits
          </button>
        </div>
        <p className="text-sm">
          Your available credits can reduce the demo bill by up to ₹{price}.
          Applying credits here is a simulation, not a real payment.
        </p>
      </Card>

      <Card>
        <h3 className="text-lg font-bold mb-3">Recovery listings</h3>

        {listings.length === 0 ? (
          <p className="text-sm text-black/50">
            No waste listed yet. Create your first listing above.
          </p>
        ) : (
          <div className="space-y-3">
            {listings.map(item => {
              const partner = recoveryPartners.find(
                p => p.id === item.partnerId
              )

              return (
                <div
                  key={item.id}
                  className="border border-black/10 rounded-xl p-4 flex flex-wrap items-center justify-between gap-3"
                >
                  <div>
                    <p className="font-semibold">
                      {item.wasteType} · {item.quantityKg} kg
                    </p>
                    <p className="text-sm text-black/50">
                      {partner?.name || 'Recovery partner'} · {item.condition}
                    </p>
                    <p className="text-sm mt-1">
                      Status: <b>{item.status}</b>
                      {item.status === 'Recovered' && ` · ${item.credits} credits earned`}
                    </p>
                  </div>

                  {item.status === 'Listed' && (
                    <button
                      onClick={() => verify(item.id)}
                      className="bg-sage text-forest rounded-full px-4 py-2 text-sm font-semibold"
                    >
                      Demo: Verify Recovery
                    </button>
                  )}
                </div>
              )
            })}
          </div>
        )}

        <p className="text-xs text-amber-700 mt-4">
          Demo only: partner names are placeholders, and recovery verification
          is simulated. No real partner collection or payment is connected.
        </p>
      </Card>
    </div>
  )
}

