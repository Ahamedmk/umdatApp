// /src/components/Navbar.jsx
import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem
} from '@/components/ui/dropdown-menu'
import {
  Sheet, SheetTrigger, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetClose
} from '@/components/ui/sheet'
import { Input } from '@/components/ui/input'
import { useAuth } from '../context/AuthContext'
import { BookOpen, Layers, RefreshCw, Scale, User2, Menu, Search } from 'lucide-react'

export function Navbar() {
  const { user, signOut } = useAuth()
  const navigate = useNavigate()

  // ⬅️ Nouveau : contrôle du Sheet (menu burger)
  const [open, setOpen] = useState(false)
  const [goto, setGoto] = useState('')

  const handleGo = () => {
    const n = parseInt(goto, 10)
    if (Number.isNaN(n)) return
    navigate(`/hadith/${n}`)
    setGoto('')
    // ferme le sheet après navigation
    setOpen(false)
  }

  const Links = ({ vertical = false }) => (
    <div className={`flex ${vertical ? 'flex-col' : 'flex-row items-center'} gap-2`}>
      <Button asChild variant="ghost" size="sm"><Link to="/learn" className="flex items-center gap-2"><BookOpen className="h-4 w-4" />Apprendre</Link></Button>
      <Button asChild variant="ghost" size="sm"><Link to="/review" className="flex items-center gap-2"><RefreshCw className="h-4 w-4" />Réviser</Link></Button>
      <Button asChild variant="ghost" size="sm"><Link to="/quiz" className="flex items-center gap-2"><Layers className="h-4 w-4" />Quiz</Link></Button>
      <Button asChild variant="ghost" size="sm"><Link to="/compare" className="flex items-center gap-2"><Scale className="h-4 w-4" />Comparer</Link></Button>
    </div>
  )

  return (
    <header className="sticky top-0 z-40 border-b bg-background/70 backdrop-blur">
      <div className="max-w-3xl mx-auto px-4 h-14 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <Badge variant="secondary" className="rounded-full">Umdat</Badge>
          <span className="font-semibold tracking-wide">Hadith • Fiqh</span>
        </Link>

        {/* Desktop (inchangé) ... */}

        {/* Mobile */}
        <div className="sm:hidden">
          {/* ⬅️ Sheet contrôlé */}
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon"><Menu className="h-5 w-5" /></Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-72">
              <SheetHeader>
                <SheetTitle>Menu de navigation</SheetTitle>
                <SheetDescription>Accède aux pages et ouvre un hadith par numéro.</SheetDescription>
              </SheetHeader>

              <div className="mt-4 space-y-4">
                {/* Accès direct numéro */}
                <div className="flex items-center gap-2">
                  <Input
                    value={goto}
                    onChange={(e) => setGoto(e.target.value)}
                    placeholder="# Hadith"
                    onKeyDown={(e) => { if (e.key === 'Enter') handleGo() }}
                  />
                  <Button variant="outline" onClick={handleGo} className="gap-1">
                    <Search className="h-4 w-4" />Go
                  </Button>
                </div>

                {/* Liens (ferment le sheet automatiquement) */}
                <div className="space-y-2">
                  <SheetClose asChild><Button variant="ghost" className="w-full justify-start" asChild><Link to="/learn">Apprendre</Link></Button></SheetClose>
                  <SheetClose asChild><Button variant="ghost" className="w-full justify-start" asChild><Link to="/review">Réviser</Link></Button></SheetClose>
                  <SheetClose asChild><Button variant="ghost" className="w-full justify-start" asChild><Link to="/quiz">Quiz</Link></Button></SheetClose>
                  <SheetClose asChild><Button variant="ghost" className="w-full justify-start" asChild><Link to="/compare">Comparer</Link></Button></SheetClose>
                </div>

                <div className="pt-4 border-t">
                  {user ? (
                    <div className="flex flex-col gap-2">
                      <SheetClose asChild><Button variant="secondary" className="w-full" asChild><Link to="/profile">Mon profil</Link></Button></SheetClose>
                      <Button variant="ghost" onClick={() => { setOpen(false); signOut() }}>Se déconnecter</Button>
                    </div>
                  ) : (
                    <SheetClose asChild><Button variant="secondary" className="w-full" asChild><Link to="/profile">Se connecter</Link></Button></SheetClose>
                  )}
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  )
}
