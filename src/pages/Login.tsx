import React from 'react'
import { useForm } from 'react-hook-form'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { LoginCredentials } from '../services/loginService'


type LoginFormValues = LoginCredentials

export default function Login() {
  const { register, handleSubmit } = useForm<LoginFormValues>()
  const { login } = useAuth()
  const navigate = useNavigate()

  const onSubmit = async (data: LoginFormValues) => {
    try {
      login(data)
      navigate('/')
    } catch (error) {
      alert(`Login incorrecto: ${error.message}`)
    }
  }

  return (
    <div className="p-4 max-w-sm mx-auto">
      <h2 className="text-xl font-bold mb-4 text-center">Login</h2>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <input {...register('email')} type="email" placeholder="Email" className="block w-full border p-2" required />
        <input {...register('password')} type="password" placeholder="Password" className="block w-full border p-2" required />
        <button type="submit" className="bg-blue-500 text-white w-full py-2 rounded">Login</button>
      </form>
    </div>
  )
}
