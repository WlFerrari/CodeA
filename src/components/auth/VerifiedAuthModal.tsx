import React, { useEffect, useRef, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Eye, EyeOff, Mail, Lock, User, GraduationCap, RefreshCw } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { universities, University } from '@/data/universities';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp';
import { sendVerificationCode, verifyCode, resendCode, clearRecord, canResend } from '@/lib/emailVerification';

interface AuthModalProps {
    isOpen: boolean;
    onClose: () => void;
    mode: 'login' | 'register';
    onModeChange: (mode: 'login' | 'register') => void;
}

const VerifiedAuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, mode, onModeChange }) => {
    const [email, setEmail] = useState('');
    const [emailPrefix, setEmailPrefix] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');
    const [selectedUniversity, setSelectedUniversity] = useState<University | null>(null);
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    // Two-step verification state
    const [step, setStep] = useState<'form' | 'verify'>('form');
    const [pendingEmail, setPendingEmail] = useState<string>('');
    const [pendingName, setPendingName] = useState<string>('');
    const [pendingPassword, setPendingPassword] = useState<string>('');
    const [pendingUniversity, setPendingUniversity] = useState<string>('');
    const [otp, setOtp] = useState('');
    const [resendSeconds, setResendSeconds] = useState<number>(0);
    const [devCode, setDevCode] = useState<string | null>(null);
    const countdownRef = useRef<number | null>(null);

    const { login, register } = useAuth();
    const { toast } = useToast();

    const resetForm = () => {
        setEmail('');
        setEmailPrefix('');
        setPassword('');
        setName('');
        setSelectedUniversity(null);
        setShowPassword(false);
        setIsLoading(false);
        // reset verification
        setStep('form');
        setPendingEmail('');
        setPendingName('');
        setPendingPassword('');
        setPendingUniversity('');
        setOtp('');
        setDevCode(null);
        setResendSeconds(0);
        if (countdownRef.current) {
            window.clearInterval(countdownRef.current);
            countdownRef.current = null;
        }
    };

    const handleClose = () => {
        if (pendingEmail) clearRecord(pendingEmail);
        resetForm();
        onClose();
    };

    useEffect(() => {
        return () => {
            if (countdownRef.current) {
                window.clearInterval(countdownRef.current);
                countdownRef.current = null;
            }
        };
    }, []);

    const startCooldown = (seconds: number) => {
        setResendSeconds(seconds);
        if (countdownRef.current) window.clearInterval(countdownRef.current);
        countdownRef.current = window.setInterval(() => {
            setResendSeconds((s) => {
                if (s <= 1) {
                    if (countdownRef.current) {
                        window.clearInterval(countdownRef.current);
                        countdownRef.current = null;
                    }
                    return 0;
                }
                return s - 1;
            });
        }, 1000) as unknown as number;
    };

    const handleSendCode = async (fullEmail: string) => {
        try {
            const result = await sendVerificationCode(fullEmail);
            startCooldown(30);
            if (result.simulated) {
                setDevCode(result.code);
                toast({ title: 'Código de verificação (DEV)', description: `Envio não configurado. Use este código: ${result.code}` });
            } else {
                setDevCode(null);
                toast({ title: 'Código enviado', description: `Enviamos um código para ${fullEmail}.` });
            }
        } catch (e) {
            toast({ title: 'Não foi possível enviar o código', description: 'Verifique sua conexão e tente novamente.', variant: 'destructive' });
            throw e;
        }
    };

    const handleResend = async () => {
        if (!pendingEmail) return;
        try {
            const can = canResend(pendingEmail);
            if (!can) return;
            const r = await resendCode(pendingEmail);
            startCooldown(30);
            if (r.ok) {
                toast({ title: 'Novo código enviado', description: r.simulated ? 'Modo DEV: código atualizado.' : `Confira sua caixa de entrada (${pendingEmail}).` });
            }
        } catch {
            toast({ title: 'Falha ao reenviar', description: 'Tente novamente em instantes.', variant: 'destructive' });
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            let fullEmail = email;

            if (mode === 'register' && selectedUniversity) {
                fullEmail = `${emailPrefix}@${selectedUniversity.domain}`;
            }

            if (mode === 'login') {
                const success = await login(fullEmail, password);
                if (!success) {
                    toast({ title: 'Erro no login', description: 'Email ou senha incorretos.', variant: 'destructive' });
                } else {
                    toast({ title: 'Login realizado!', description: 'Bem-vindo de volta ao Project Code Academic!' });
                    handleClose();
                    setIsLoading(false);
                    return;
                }
            } else {
                if (!name.trim()) {
                    toast({ title: 'Campo obrigatório', description: 'Por favor, insira seu nome.', variant: 'destructive' });
                    setIsLoading(false);
                    return;
                }
                if (!selectedUniversity) {
                    toast({ title: 'Campo obrigatório', description: 'Por favor, selecione sua faculdade.', variant: 'destructive' });
                    setIsLoading(false);
                    return;
                }
                if (!emailPrefix.trim()) {
                    toast({ title: 'Campo obrigatório', description: 'Por favor, insira seu email institucional.', variant: 'destructive' });
                    setIsLoading(false);
                    return;
                }

                // send code and switch to verify step
                await handleSendCode(fullEmail);
                setPendingEmail(fullEmail);
                setPendingName(name);
                setPendingPassword(password);
                setPendingUniversity(selectedUniversity.name);
                setStep('verify');
                setIsLoading(false);
                return;
            }
        } catch (error) {
            toast({ title: 'Erro', description: 'Algo deu errado. Tente novamente.', variant: 'destructive' });
        } finally {
            setIsLoading(false);
        }
    };

    const handleVerifyAndRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!pendingEmail) return;
        setIsLoading(true);
        try {
            const result = verifyCode(pendingEmail, otp);
            if (!result.ok) {
                const msg = 'reason' in result && result.reason === 'expired'
                    ? 'Código expirou. Reenvie um novo.'
                    : 'Código inválido. Tente novamente.';
                toast({ title: 'Verificação falhou', description: msg, variant: 'destructive' });
                setIsLoading(false);
                return;
            }

            const success = await register(pendingName, pendingEmail, pendingPassword, pendingUniversity);
            if (!success) {
                toast({ title: 'Erro no cadastro', description: 'Este email já está em uso.', variant: 'destructive' });
                setIsLoading(false);
                return;
            }

            clearRecord(pendingEmail);
            toast({ title: 'Cadastro realizado!', description: 'Email verificado com sucesso.' });
            handleClose();
        } catch {
            toast({ title: 'Erro', description: 'Não foi possível concluir o cadastro.', variant: 'destructive' });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={handleClose}>
            <DialogContent className="sm:max-w-md bg-gradient-card border-border">
                <DialogHeader>
                    <DialogTitle className="text-center text-2xl font-bold text-foreground">
                        {mode === 'login' ? 'Fazer Login' : step === 'form' ? 'Criar Conta' : 'Verificar Email'}
                    </DialogTitle>
                </DialogHeader>

                {mode === 'register' && step === 'verify' ? (
                    <form onSubmit={handleVerifyAndRegister} className="space-y-4">
                        <div className="space-y-2">
                            <p className="text-sm text-muted-foreground">
                                Enviamos um código de 6 dígitos para <span className="font-medium text-foreground">{pendingEmail}</span>. Insira abaixo para confirmar seu email.
                            </p>
                            {devCode && (
                                <p className="text-xs text-amber-500">Modo DEV: código = {devCode}</p>
                            )}
                            <InputOTP maxLength={6} value={otp} onChange={setOtp}>
                                <InputOTPGroup>
                                    <InputOTPSlot index={0} />
                                    <InputOTPSlot index={1} />
                                    <InputOTPSlot index={2} />
                                    <InputOTPSlot index={3} />
                                    <InputOTPSlot index={4} />
                                    <InputOTPSlot index={5} />
                                </InputOTPGroup>
                            </InputOTP>
                        </div>

                        <div className="flex items-center justify-between gap-2">
                            <Button type="button" variant="secondary" onClick={() => { setStep('form'); setOtp(''); }}>Voltar</Button>
                            <div className="flex items-center gap-2">
                                <Button type="button" variant="outline" disabled={resendSeconds > 0} onClick={handleResend}>
                                    <RefreshCw className="h-4 w-4 mr-2" />
                                    {resendSeconds > 0 ? `Reenviar (${resendSeconds}s)` : 'Reenviar código'}
                                </Button>
                                <Button type="submit" className="bg-gradient-primary text-primary-foreground" disabled={isLoading || otp.length !== 6}>
                                    {isLoading ? 'Verificando...' : 'Confirmar'}
                                </Button>
                            </div>
                        </div>
                    </form>
                ) : (
                    <form onSubmit={handleSubmit} className="space-y-4">
                        {mode === 'register' && (
                            <div className="space-y-2">
                                <Label htmlFor="name" className="text-foreground">Nome completo</Label>
                                <div className="relative">
                                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                                    <Input
                                        id="name"
                                        type="text"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        className="pl-10"
                                        placeholder="Seu nome completo"
                                        required
                                    />
                                </div>
                            </div>
                        )}

                        {mode === 'register' && (
                            <div className="space-y-2">
                                <Label htmlFor="university" className="text-foreground">Faculdade</Label>
                                <div className="relative">
                                    <GraduationCap className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4 z-10" />
                                    <Select value={selectedUniversity?.name || ''} onValueChange={(value) => {
                                        const university = universities.find(u => u.name === value);
                                        setSelectedUniversity(university || null);
                                        setEmailPrefix('');
                                    }} required>
                                        <SelectTrigger className="pl-10">
                                            <SelectValue placeholder="Selecione sua faculdade" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {universities.map((uni) => (
                                                <SelectItem key={uni.name} value={uni.name}>
                                                    {uni.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                        )}

                        <div className="space-y-2">
                            <Label htmlFor="email" className="text-foreground">Email {mode === 'register' ? 'Institucional' : ''}</Label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                                {mode === 'register' && selectedUniversity ? (
                                    <div className="flex">
                                        <Input
                                            id="emailPrefix"
                                            type="text"
                                            value={emailPrefix}
                                            onChange={(e) => setEmailPrefix(e.target.value)}
                                            className="pl-10 rounded-r-none border-r-0"
                                            placeholder="seu.nome"
                                            required
                                        />
                                        <div className="px-3 py-2 bg-muted border border-l-0 rounded-r-md text-muted-foreground text-sm flex items-center">
                                            @{selectedUniversity.domain}
                                        </div>
                                    </div>
                                ) : (
                                    <Input
                                        id="email"
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="pl-10"
                                        placeholder="seu@email.com"
                                        required
                                    />
                                )}
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="password" className="text-foreground">Senha</Label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                                <Input
                                    id="password"
                                    type={showPassword ? 'text' : 'password'}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="pl-10 pr-10"
                                    placeholder="Sua senha"
                                    required
                                    minLength={6}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
                                >
                                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                </button>
                            </div>
                        </div>

                        <Button
                            type="submit"
                            className="w-full bg-gradient-primary text-primary-foreground hover:opacity-90"
                            disabled={isLoading}
                        >
                            {isLoading ? 'Carregando...' : (mode === 'login' ? 'Entrar' : 'Criar Conta')}
                        </Button>
                    </form>
                )}

                <div className="text-center">
                    <p className="text-sm text-muted-foreground">
                        {mode === 'login' ? 'Não tem uma conta?' : 'Já tem uma conta?'}{' '}
                        <button
                            type="button"
                            onClick={() => onModeChange(mode === 'login' ? 'register' : 'login')}
                            className="text-primary hover:underline font-medium"
                        >
                            {mode === 'login' ? 'Cadastre-se' : 'Faça login'}
                        </button>
                    </p>
                </div>
            </DialogContent>
        </Dialog>
    );
};

export default VerifiedAuthModal;