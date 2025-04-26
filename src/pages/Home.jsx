import { React } from 'react'
import { Link } from 'react-router-dom'

export default function Home() {
  return (
    <div className="p-4">
      <h1 className="text-xl font-bold mb-4">Home</h1>
      <ul className="list-disc pl-6">
        <li><Link to="/estancias" className="text-blue-600 underline">Estancias</Link></li>
        <li><Link to="/lotes" className="text-blue-600 underline">Lotes</Link></li>
      </ul>
    </div>
  )
} 
