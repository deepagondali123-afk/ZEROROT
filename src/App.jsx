import {HashRouter,Routes,Route,Navigate} from 'react-router-dom'
import {RLayout,Dashboard,Inventory,Insights,Pricing,Surplus,Impact,Recovery} from './retailer'
import {CLayout,Deals,Product,Cart} from './customer'
import {useStore} from './store'
export default function App(){const t=useStore(s=>s.toast)
return<HashRouter><Routes><Route path="/r" element={<RLayout/>}><Route index element={<Dashboard/>}/><Route path="inventory" element={<Inventory/>}/><Route path="insights" element={<Insights/>}/><Route path="pricing" element={<Pricing/>}/><Route path="surplus" element={<Surplus/>}/><Route path="impact" element={<Impact/>}/><Route path="recovery" element={<Recovery/>}/></Route>
<Route path="/c" element={<CLayout/>}><Route index element={<Deals hero/>}/><Route path="deals" element={<Deals/>}/><Route path="p/:id" element={<Product/>}/><Route path="cart" element={<Cart/>}/></Route><Route path="*" element={<Navigate to="/r"/>}/></Routes>
{t&&<div role="status" className="fixed bottom-5 left-1/2 -translate-x-1/2 bg-forest text-white px-5 py-3 rounded-full shadow-xl z-50">{t}</div>}</HashRouter>}
