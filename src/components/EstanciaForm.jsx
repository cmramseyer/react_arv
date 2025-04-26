import { React } from 'react'
import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import PropTypes from 'prop-types'

export default function EstanciaForm({ onSubmit, estancia }) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors }
  } = useForm({
    defaultValues: {
      nombre: '',
      contacto: '',
      telefono: '',
      email: ''
    }
  })

  // Si cambia la estancia, actualizamos el form
  useEffect(() => {
    if (estancia) reset(estancia)
  }, [estancia, reset])

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <div>
        <label>Nombre</label>
        <input
          {...register('nombre', { required: 'El nombre es requerido' })}
        />
        {errors.nombre && <span style={{ color: 'red' }}>{errors.nombre.message}</span>}
      </div>

      <div>
        <label>Contacto</label>
        <input
          {...register('contacto', { required: 'El contacto es requerido' })}
        />
        {errors.contacto && <span style={{ color: 'red' }}>{errors.contacto.message}</span>}
      </div>

      <div>
        <label>Teléfono</label>
        <input
          {...register('telefono', {
            required: 'El teléfono es requerido',
            pattern: {
              value: /^\d{7,15}$/,
              message: 'El teléfono debe tener entre 7 y 15 dígitos'
            }
          })}
        />
        {errors.telefono && <span style={{ color: 'red' }}>{errors.telefono.message}</span>}
      </div>

      <div>
        <label>Email</label>
        <input
          {...register('email', {
            required: 'El email es requerido',
            pattern: {
              value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
              message: 'El email no es válido'
            }
          })}
        />
        {errors.email && <span style={{ color: 'red' }}>{errors.email.message}</span>}
      </div>

      <button type="submit">{estancia ? 'Actualizar' : 'Crear'}</button>
    </form>
  )
}

EstanciaForm.propTypes = {
  onSubmit: PropTypes.func.isRequired,
  estancia: PropTypes.array.isRequired,
}