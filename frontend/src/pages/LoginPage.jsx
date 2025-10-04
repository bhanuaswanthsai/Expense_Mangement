import { useContext, useState } from 'react'
import { AuthContext } from '../context/AuthContext.jsx'
import { useNavigate } from 'react-router-dom'
import Shell from '../components/Layout/Shell.jsx'
import { useEffect } from 'react'

export default function LoginPage() {
  const { login, signup } = useContext(AuthContext)
  const [mode, setMode] = useState('login')
  const [email, setEmail] = useState('admin@acme.com')
  const [password, setPassword] = useState('admin123')
  const [companyName, setCompanyName] = useState('Acme Inc')
  const [country, setCountry] = useState('United States')
  const [userName, setUserName] = useState('Admin')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [countries, setCountries] = useState([])
  const [countryLoading, setCountryLoading] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    if (mode !== 'signup') return
    const load = async () => {
      try {
        setCountryLoading(true)
        const res = await fetch('https://restcountries.com/v3.1/all?fields=name,currencies')
        const data = await res.json()
        const list = data
          .map(c => ({
            name: c?.name?.common,
            currency: c?.currencies ? Object.keys(c.currencies)[0] : undefined
          }))
          .filter(c => !!c.name)
          .sort((a,b)=> a.name.localeCompare(b.name))
        setCountries(list)
      } catch (_) {
        // ignore; keep manual entry fallback
      } finally {
        setCountryLoading(false)
      }
    }
    load()
  }, [mode])

  const onSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    try {
      if (mode === 'login') {
        await login(email, password)
      } else {
        await signup({ companyName, country, userName, email, password })
      }
      navigate('/dashboard')
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Shell>
      <div className="relative min-h-[82vh] overflow-hidden">
        <div className="absolute top-6 left-0 right-0 text-center fade-in">
          <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight text-slate-900 dark:text-slate-100">
            <span className="animate-pulse">EXPENSE</span>
            <span className="animate-bounce"> TRACKER</span>
          </h1>
        </div>
        <div className="flex items-center justify-center mt-24 md:mt-28">
          <div className="bg-white/90 dark:bg-slate-800/90 backdrop-blur shadow-2xl rounded-xl p-6 w-full max-w-md border dark:border-slate-700 card-lift">
            <h2 className="text-xl font-semibold mb-1">{mode === 'login' ? 'Welcome back' : 'Create your company'}</h2>
            <p className="text-sm text-gray-600 dark:text-slate-300 mb-4">{mode === 'login' ? 'Sign in to manage your expenses' : 'Sign up to get started'}</p>
            <form onSubmit={onSubmit} className="space-y-3">
            {mode === 'signup' && (
              <>
                <input className="w-full border dark:border-slate-600 rounded p-2 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Company Name" value={companyName} onChange={e=>setCompanyName(e.target.value)} />
                {countries.length > 0 ? (
                  <div>
                    <select className="w-full border dark:border-slate-600 rounded p-2 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500" value={country} onChange={e=>setCountry(e.target.value)}>
                      {countries.map(c => (
                        <option key={c.name} value={c.name}>{c.name}{c.currency ? ` (${c.currency})` : ''}</option>
                      ))}
                    </select>
                    <div className="text-xs text-gray-500 mt-1">Selecting a country sets your company currency automatically.</div>
                  </div>
                ) : (
                  <input className="w-full border dark:border-slate-600 rounded p-2 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Country" value={country} onChange={e=>setCountry(e.target.value)} />
                )}
                <input className="w-full border dark:border-slate-600 rounded p-2 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Your Name" value={userName} onChange={e=>setUserName(e.target.value)} />
              </>
            )}
            <input className="w-full border dark:border-slate-600 rounded p-2 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Email" value={email} onChange={e=>setEmail(e.target.value)} />
            <input className="w-full border dark:border-slate-600 rounded p-2 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500" type="password" placeholder="Password" value={password} onChange={e=>setPassword(e.target.value)} />
            {error && <div className="text-red-600 text-sm">{error}</div>}
            <button disabled={loading} className="w-full bg-blue-600 hover:bg-green-600 transition duration-300 ease-out transform hover:scale-105 text-white rounded p-2 shadow hover:shadow-lg cursor-pointer">
              {loading ? 'Please wait...' : (mode === 'login' ? 'Login' : 'Create Account')}
            </button>
            </form>
            <div className="text-sm mt-4">
              {mode === 'login' ? (
                <button className="text-blue-600 hover:text-green-600 transition" onClick={()=>setMode('signup')}>Need an account? Sign up</button>
              ) : (
                <button className="text-blue-600 hover:text-green-600 transition" onClick={()=>setMode('login')}>Have an account? Log in</button>
              )}
            </div>
          </div>
        </div>
      </div>
    </Shell>
  )
}
