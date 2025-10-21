import React, { useState, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, X, Trophy, GraduationCap, Camera, Edit2 } from 'lucide-react';
import { universities } from '@/data/universities';
import { useToast } from '@/hooks/use-toast';
import Cropper from 'react-easy-crop';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Slider } from '@/components/ui/slider';
import { getCroppedImage, CroppedAreaPixels } from '@/lib/image-crop';

// Tipo auxiliar para usuários salvos no localStorage
interface StoredUser {
  id: string;
  name: string;
  email: string;
  password?: string;
  score: number;
  university: string;
  avatarUrl?: string;
  bannerUrl?: string;
}

type CropType = 'avatar' | 'banner';

const Profile = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [editedName, setEditedName] = useState(user?.name || '');
  const avatarInputRef = useRef<HTMLInputElement | null>(null);
  const bannerInputRef = useRef<HTMLInputElement | null>(null);

  // Crop state
  const [isCropOpen, setIsCropOpen] = useState(false);
  const [cropType, setCropType] = useState<CropType>('avatar');
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [crop, setCrop] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [zoom, setZoom] = useState<number>(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<CroppedAreaPixels | null>(null);

  if (!user) {
    navigate('/');
    return null;
  }

  const university = universities.find(u => u.name === user.university);
  const userInitials = user.name.split(' ').map(n => n[0]).join('').toUpperCase();

  const persistUserField = (partial: Partial<StoredUser>) => {
    const users: StoredUser[] = JSON.parse(localStorage.getItem('academic_users') || '[]');
    const idx = users.findIndex((u) => u.id === user.id);
    if (idx !== -1) {
      users[idx] = { ...users[idx], ...partial };
      localStorage.setItem('academic_users', JSON.stringify(users));
    }
    const updatedUser = { ...user, ...partial };
    localStorage.setItem('academic_user', JSON.stringify(updatedUser));
  };

  const handleSave = () => {
    if (editedName.trim()) {
      persistUserField({ name: editedName.trim() });
      toast({
        title: 'Perfil atualizado',
        description: 'Suas informações foram salvas com sucesso.',
      });
      setIsEditing(false);
      window.location.reload();
    }
  };

  const handleCancel = () => {
    setEditedName(user.name);
    setIsEditing(false);
  };

  const readFileAsDataUrl = (file: File): Promise<string> =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });

  const handleSelectImage = async (
    e: React.ChangeEvent<HTMLInputElement>,
    type: CropType
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
    const maxSize = 4 * 1024 * 1024; // 4MB para melhor qualidade
    if (!validTypes.includes(file.type)) {
      toast({ title: 'Formato inválido', description: 'Use JPG, PNG ou WEBP.' });
      e.target.value = '';
      return;
    }
    if (file.size > maxSize) {
      toast({ title: 'Arquivo muito grande', description: 'Tamanho máximo: 4MB.' });
      e.target.value = '';
      return;
    }

    try {
      const dataUrl = await readFileAsDataUrl(file);
      setCropType(type);
      setImageSrc(dataUrl);
      setZoom(1);
      setCrop({ x: 0, y: 0 });
      setIsCropOpen(true);
    } catch (err) {
      toast({ title: 'Erro ao carregar imagem', description: 'Tente novamente.' });
    } finally {
      e.target.value = '';
    }
  };

  const onCropComplete = (_: any, areaPixels: CroppedAreaPixels) => {
    setCroppedAreaPixels(areaPixels);
  };

  const handleConfirmCrop = async () => {
    if (!imageSrc || !croppedAreaPixels) return;
    try {
      const isAvatar = cropType === 'avatar';
      const aspect = isAvatar ? 1 : 3; // 1:1 avatar, 3:1 banner
      const outWidth = isAvatar ? 512 : 1500; // tamanhos maiores para boa qualidade
      const outHeight = Math.round(outWidth / aspect);

      const cropped = await getCroppedImage(imageSrc, croppedAreaPixels, {
        width: outWidth,
        height: outHeight,
        mimeType: 'image/jpeg',
        quality: 0.92,
        round: isAvatar,
      });

      if (isAvatar) {
        persistUserField({ avatarUrl: cropped });
      } else {
        persistUserField({ bannerUrl: cropped });
      }
      toast({ title: 'Imagem atualizada', description: 'Alteração salva com sucesso.' });
      setIsCropOpen(false);
      setImageSrc(null);
      window.location.reload();
    } catch (err) {
      toast({ title: 'Falha ao recortar', description: 'Tente novamente.' });
    }
  };

  const getScoreLevel = (score: number) => {
    if (score >= 1000) return { level: 'Expert', color: 'bg-gradient-to-r from-academic-primary to-academic-accent' };
    if (score >= 500) return { level: 'Avançado', color: 'bg-gradient-to-r from-academic-secondary to-academic-primary' };
    if (score >= 200) return { level: 'Intermediário', color: 'bg-gradient-to-r from-academic-accent to-academic-secondary' };
    return { level: 'Iniciante', color: 'bg-gradient-to-r from-muted to-academic-accent' };
  };

  const scoreLevel = getScoreLevel(user.score);

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <Button 
            variant="ghost" 
            onClick={() => navigate('/dashboard')}
            className="mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar ao Dashboard
          </Button>
        </div>

        <div className="max-w-4xl mx-auto space-y-6">
          {/* Header Card */}
          <Card className="bg-card border-border shadow-academic overflow-hidden">
            <CardContent className="p-0">
              {/* Banner */}
              <div className="relative h-32 md:h-40 w-full">
                {user.bannerUrl ? (
                  <img src={user.bannerUrl} alt="Banner do perfil" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-gradient-primary" />
                )}
                {/* Hidden input for banner */}
                <input
                  ref={bannerInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  className="hidden"
                  onChange={(e) => handleSelectImage(e, 'banner')}
                />
                <Button
                  size="sm"
                  variant="secondary"
                  className="absolute bottom-2 right-2 backdrop-blur bg-background/70"
                  onClick={() => bannerInputRef.current?.click()}
                >
                  <Camera className="w-4 h-4 mr-2" /> Trocar banner
                </Button>
              </div>

              {/* Avatar + Info */}
              <div className="p-6 md:p-8">
                <div className="flex items-center gap-6">
                  <div className="relative">
                    <Avatar className="h-24 w-24 border-4 border-background">
                      {user.avatarUrl ? (
                        <AvatarImage src={user.avatarUrl} alt={user.name} className="object-cover" />
                      ) : (
                        <AvatarFallback className="bg-primary/10 text-primary text-2xl font-bold">
                          {userInitials}
                        </AvatarFallback>
                      )}
                    </Avatar>
                    {/* Hidden input for avatar */}
                    <input
                      ref={avatarInputRef}
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      className="hidden"
                      onChange={(e) => handleSelectImage(e, 'avatar')}
                    />
                    <Button
                      size="icon"
                      variant="secondary"
                      className="h-8 w-8 rounded-full shadow absolute -bottom-2 -right-2"
                      onClick={() => avatarInputRef.current?.click()}
                    >
                      <Camera className="w-4 h-4" />
                    </Button>
                  </div>

                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      {isEditing ? (
                        <div className="flex items-center gap-2">
                          <Input
                            value={editedName}
                            onChange={(e) => setEditedName(e.target.value)}
                            className="max-w-sm"
                            placeholder="Seu nome"
                          />
                          <Button size="icon" variant="ghost" onClick={handleSave}>
                            <Save className="w-4 h-4" />
                          </Button>
                          <Button size="icon" variant="ghost" onClick={handleCancel}>
                            <X className="w-4 h-4" />
                          </Button>
                        </div>
                      ) : (
                        <>
                          <h1 className="text-3xl font-bold text-foreground">{user.name}</h1>
                          <Button size="icon" variant="ghost" onClick={() => setIsEditing(true)}>
                            <Edit2 className="w-4 h-4" />
                          </Button>
                        </>
                      )}
                    </div>

                    <div className="flex items-center gap-4 text-muted-foreground">
                      <div className="flex items-center gap-2">
                        <GraduationCap className="w-5 h-5" />
                        <span>{university?.name}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Trophy className="w-5 h-5" />
                        <span>{user.score} pontos</span>
                      </div>
                    </div>

                    <Badge className="mt-3">{scoreLevel.level}</Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Informações Pessoais */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <GraduationCap className="w-5 h-5 text-primary" />
                  Informações Acadêmicas
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Email</Label>
                  <p className="text-foreground">{user.email}</p>
                </div>
                
                <Separator />
                
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Universidade</Label>
                  <p className="text-foreground">{university?.name}</p>
                </div>
                
                <Separator />
                
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Domínio Institucional</Label>
                  <p className="text-foreground">{university?.domain}</p>
                </div>
              </CardContent>
            </Card>

            {/* Estatísticas */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Trophy className="w-5 h-5 text-academic-gold" />
                  Estatísticas de Desempenho
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-4 bg-muted/30 rounded-lg">
                    <div className="text-2xl font-bold text-primary">{user.score}</div>
                    <div className="text-sm text-muted-foreground">Pontos Totais</div>
                  </div>
                  
                  <div className="text-center p-4 bg-muted/30 rounded-lg">
                    <div className="text-2xl font-bold text-secondary-foreground">{scoreLevel.level}</div>
                    <div className="text-sm text-muted-foreground">Nível Atual</div>
                  </div>
                </div>
                
                <Separator />
                
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Progresso para o próximo nível</Label>
                  <div className="mt-2">
                    {user.score < 200 ? (
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span>Iniciante</span>
                          <span>{user.score}/200</span>
                        </div>
                        <div className="w-full bg-muted rounded-full h-2">
                          <div 
                            className="bg-gradient-to-r from-academic-gold to-secondary h-2 rounded-full transition-all duration-300"
                            style={{ width: `${(user.score / 200) * 100}%` }}
                          />
                        </div>
                      </div>
                    ) : user.score < 500 ? (
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span>Intermediário</span>
                          <span>{user.score}/500</span>
                        </div>
                        <div className="w-full bg-muted rounded-full h-2">
                          <div 
                            className="bg-gradient-to-r from-secondary to-primary h-2 rounded-full transition-all duration-300"
                            style={{ width: `${(user.score / 500) * 100}%` }}
                          />
                        </div>
                      </div>
                    ) : user.score < 1000 ? (
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span>Avançado</span>
                          <span>{user.score}/1000</span>
                        </div>
                        <div className="w-full bg-muted rounded-full h-2">
                          <div 
                            className="bg-gradient-to-r from-primary to-academic-gold h-2 rounded-full transition-all duration-300"
                            style={{ width: `${(user.score / 1000) * 100}%` }}
                          />
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-4">
                        <Badge className="bg-gradient-primary text-primary-foreground">
                          Nível Máximo Alcançado! 🎉
                        </Badge>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Ações */}
          <Card>
            <CardContent className="p-6">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="font-semibold text-foreground">Configurações da Conta</h3>
                  <p className="text-sm text-muted-foreground">Gerencie suas preferências e configurações</p>
                </div>
                <Button 
                  variant="destructive" 
                  onClick={() => {
                    logout();
                    navigate('/');
                  }}
                >
                  Sair da Conta
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Modal de Recorte */}
      <Dialog open={isCropOpen} onOpenChange={setIsCropOpen}>
        <DialogContent className="sm:max-w-[800px]">
          <DialogHeader>
            <DialogTitle>{cropType === 'avatar' ? 'Ajustar foto de perfil' : 'Ajustar banner'}</DialogTitle>
          </DialogHeader>
          <div className="relative w-full" style={{ height: '60vh' }}>
            {imageSrc && (
              <Cropper
                image={imageSrc}
                crop={crop}
                zoom={zoom}
                aspect={cropType === 'avatar' ? 1 : 3}
                cropShape={cropType === 'avatar' ? 'round' : 'rect'}
                showGrid={false}
                onCropChange={setCrop}
                onZoomChange={(z) => setZoom(z)}
                onCropComplete={onCropComplete}
                objectFit="contain"
              />
            )}
          </div>
          <div className="flex items-center gap-4 py-2">
            <Label>Zoom</Label>
            <div className="w-full max-w-sm">
              <Slider value={[zoom]} min={1} max={3} step={0.05} onValueChange={(v) => setZoom(v[0])} />
            </div>
          </div>
          <DialogFooter className="flex gap-2">
            <Button variant="secondary" onClick={() => setIsCropOpen(false)}>Cancelar</Button>
            <Button onClick={handleConfirmCrop}>Salvar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Profile;
