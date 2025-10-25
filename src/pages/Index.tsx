import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import Navbar from '@/components/ui/navbar';
import AuthModal from '@/components/auth/VerifiedAuthModal';
import Dashboard from './Dashboard';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { GraduationCap, Brain, Trophy, Users, Play, BookOpen } from 'lucide-react';
import heroImage from '@/assets/hero-academic.jpg';
import { api } from '@/lib/api';

export type LeaderboardUser = {
    id: string;
    name: string;
    email: string;
    score: number;
    university?: string;
    avatarUrl?: string;
    bannerUrl?: string;
    role?: string;
};

const Index = () => {
    const { user } = useAuth();
    const [authModal, setAuthModal] = useState<{ isOpen: boolean; mode: 'login' | 'register' }>({
        isOpen: false,
        mode: 'login'
    });

    useEffect(() => {
        // Always try to persist the current user to backend on login/register
        if (user?.email && user?.name) {
            api.upsertUser({
                id: user.id,
                name: user.name,
                email: user.email,
                university: user.university ?? null,
                avatarUrl: user.avatarUrl ?? null,
                bannerUrl: user.bannerUrl ?? null,
                role: user.role ?? 'user',
                score: user.score ?? 0,
            } as Partial<LeaderboardUser>).catch(() => {});
        }
    }, [user?.id, user?.email, user?.name]);

    const handleShowAuth = (mode: 'login' | 'register') => {
        setAuthModal({ isOpen: true, mode });
    };

    const handleCloseAuth = () => {
        setAuthModal({ isOpen: false, mode: 'login' });
    };

    const handleModeChange = (mode: 'login' | 'register') => {
        setAuthModal(prev => ({ ...prev, mode }));
    };

    // If user is logged in, show dashboard
    if (user) {
        return (
            <div className="min-h-screen bg-background">
                <Navbar onShowAuth={handleShowAuth} />
                <Dashboard />
            </div>
        );
    }

    // Landing page for non-authenticated users
    return (
        <div className="min-h-screen bg-background">
            <Navbar onShowAuth={handleShowAuth} />

            {/* Hero Section */}
            <section className="relative py-20 px-4">
                <div className="max-w-7xl mx-auto">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                        <div className="space-y-8">
                            <div className="space-y-4">
                                <h1 className="text-5xl lg:text-6xl font-bold text-foreground leading-tight">
                                    Project Code
                                    <span className="block bg-gradient-primary bg-clip-text text-transparent">
                    Academic
                  </span>
                                </h1>
                                <p className="text-xl text-muted-foreground">
                                    Aprenda brincando, evolua jogando!
                                </p>
                                <p className="text-lg text-muted-foreground">
                                    Uma plataforma de quizzes educacionais para estudantes universitários
                                    revisarem o conteúdo das disciplinas do curso de forma divertida e interativa.
                                </p>
                            </div>

                            <div className="flex flex-col sm:flex-row gap-4">
                                <Button
                                    size="lg"
                                    onClick={() => handleShowAuth('register')}
                                    className="bg-gradient-primary text-primary-foreground hover:opacity-90 shadow-glow"
                                >
                                    <GraduationCap className="mr-2 h-5 w-5" />
                                    Começar Agora
                                </Button>
                                <Button
                                    size="lg"
                                    variant="outline"
                                    onClick={() => handleShowAuth('login')}
                                    className="border-primary text-primary hover:bg-primary hover:text-primary-foreground"
                                >
                                    <Play className="mr-2 h-5 w-5" />
                                    Fazer Login
                                </Button>
                            </div>
                        </div>

                        <div className="relative">
                            <div className="absolute inset-0 bg-gradient-primary opacity-20 blur-3xl"></div>
                            <img
                                src={heroImage}
                                alt="Estudantes aprendendo"
                                className="relative z-10 rounded-2xl shadow-academic w-full"
                            />
                        </div>
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section className="py-20 px-4 bg-muted/30">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl font-bold text-foreground mb-4">
                            Por que escolher o Project Code Academic?
                        </h2>
                        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                            Nossa plataforma oferece uma experiência de aprendizado completa e envolvente
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                        <Card className="bg-gradient-card border-border hover:shadow-academic transition-all duration-300 hover:scale-105">
                            <CardContent className="p-6 text-center space-y-4">
                                <div className="w-12 h-12 bg-gradient-primary rounded-full flex items-center justify-center mx-auto">
                                    <Brain className="h-6 w-6 text-primary-foreground" />
                                </div>
                                <h3 className="text-lg font-semibold text-foreground">Aprendizado Interativo</h3>
                                <p className="text-sm text-muted-foreground">
                                    Quizzes dinâmicos que tornam o estudo mais divertido e eficaz
                                </p>
                            </CardContent>
                        </Card>

                        <Card className="bg-gradient-card border-border hover:shadow-academic transition-all duration-300 hover:scale-105">
                            <CardContent className="p-6 text-center space-y-4">
                                <div className="w-12 h-12 bg-gradient-primary rounded-full flex items-center justify-center mx-auto">
                                    <BookOpen className="h-6 w-6 text-primary-foreground" />
                                </div>
                                <h3 className="text-lg font-semibold text-foreground">Múltiplas Disciplinas</h3>
                                <p className="text-sm text-muted-foreground">
                                    Conteúdo abrangente cobrindo diversas matérias do curso
                                </p>
                            </CardContent>
                        </Card>

                        <Card className="bg-gradient-card border-border hover:shadow-academic transition-all duration-300 hover:scale-105">
                            <CardContent className="p-6 text-center space-y-4">
                                <div className="w-12 h-12 bg-gradient-primary rounded-full flex items-center justify-center mx-auto">
                                    <Trophy className="h-6 w-6 text-primary-foreground" />
                                </div>
                                <h3 className="text-lg font-semibold text-foreground">Sistema de Pontos</h3>
                                <p className="text-sm text-muted-foreground">
                                    Ganhe pontos e acompanhe seu progresso de aprendizado
                                </p>
                            </CardContent>
                        </Card>

                        <Card className="bg-gradient-card border-border hover:shadow-academic transition-all duration-300 hover:scale-105">
                            <CardContent className="p-6 text-center space-y-4">
                                <div className="w-12 h-12 bg-gradient-primary rounded-full flex items-center justify-center mx-auto">
                                    <Users className="h-6 w-6 text-primary-foreground" />
                                </div>
                                <h3 className="text-lg font-semibold text-foreground">Ranking Competitivo</h3>
                                <p className="text-sm text-muted-foreground">
                                    Compare seu desempenho com outros estudantes
                                </p>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-20 px-4">
                <div className="max-w-4xl mx-auto text-center space-y-8">
                    <h2 className="text-3xl font-bold text-foreground">
                        Pronto para começar sua jornada de aprendizado?
                    </h2>
                    <p className="text-lg text-muted-foreground">
                        Junte-se a milhares de estudantes que já estão aprendendo de forma mais eficiente
                    </p>
                    <Button
                        size="lg"
                        onClick={() => handleShowAuth('register')}
                        className="bg-gradient-primary text-primary-foreground hover:opacity-90 shadow-glow"
                    >
                        <GraduationCap className="mr-2 h-5 w-5" />
                        Cadastrar-se Gratuitamente
                    </Button>
                </div>
            </section>

            {/* Auth Modal */}
            <AuthModal
                isOpen={authModal.isOpen}
                onClose={handleCloseAuth}
                mode={authModal.mode}
                onModeChange={handleModeChange}
            />
        </div>
    );
};

export default Index;