import { useEffect, useState } from 'react'
import { getEstancias, createEstancia, updateEstancia, deleteEstancia } from '../services/estanciasService'
import EstanciaForm from '../components/EstanciaForm'
import EstanciaList from '../components/EstanciaList'

export default function Estancias() {
  const [estancias, setEstancias] = useState([])
  const [selected, setSelected] = useState(null)

  useEffect(() => {
    fetchEstancias()
  }, [])

  const fetchEstancias = async () => {
    const data = await getEstancias()
    setEstancias(data)
  }

  const handleSubmit = async (formData) => {
    if (selected) {
      await updateEstancia(selected.id, formData)
    } else {
      await createEstancia(formData)
    }
    setSelected(null)
    fetchEstancias()
  }

  const handleEdit = (estancia) => setSelected(estancia)

  const handleDelete = async (id) => {
    await deleteEstancia(id)
    fetchEstancias()
  }

  return (
    <div>
      <h2>CRUD Estancias</h2>
      <EstanciaForm onSubmit={handleSubmit} estancia={selected} />
      <EstanciaList estancias={estancias} onEdit={handleEdit} onDelete={handleDelete} />
    </div>
  )
}
