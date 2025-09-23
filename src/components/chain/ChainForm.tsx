import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useChain } from '@/hooks/useChain';

interface ChainFormProps {
  onClose: () => void;
  chain?: any;
}

const ChainForm = ({ onClose, chain }: ChainFormProps) => {
  const { createChain, updateChain } = useChain();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: chain?.name || '',
    description: chain?.description || '',
    headquarters_address: chain?.headquarters_address || '',
    contact_email: chain?.contact_email || '',
    contact_phone: chain?.contact_phone || '',
    logo_url: chain?.logo_url || '',
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (chain) {
        await updateChain(chain.id, formData);
      } else {
        await createChain(formData);
      }
      onClose();
    } catch (error) {
      console.error('Error saving chain:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {chain ? 'Editar Rede' : 'Nova Rede de Restaurantes'}
          </DialogTitle>
          <DialogDescription>
            {chain ? 'Atualize as informações da rede' : 'Crie uma nova rede para gerenciar múltiplos restaurantes'}
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 gap-4">
            <div>
              <Label htmlFor="name">Nome da Rede *</Label>
              <Input
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="Ex: Grupo Sabor & Cia"
                required
              />
            </div>

            <div>
              <Label htmlFor="description">Descrição</Label>
              <Textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Descreva a rede de restaurantes..."
                rows={3}
              />
            </div>

            <div>
              <Label htmlFor="headquarters_address">Endereço da Sede</Label>
              <Input
                id="headquarters_address"
                name="headquarters_address"
                value={formData.headquarters_address}
                onChange={handleInputChange}
                placeholder="Endereço completo da sede"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="contact_email">E-mail de Contato</Label>
                <Input
                  id="contact_email"
                  name="contact_email"
                  type="email"
                  value={formData.contact_email}
                  onChange={handleInputChange}
                  placeholder="contato@rede.com"
                />
              </div>

              <div>
                <Label htmlFor="contact_phone">Telefone</Label>
                <Input
                  id="contact_phone"
                  name="contact_phone"
                  value={formData.contact_phone}
                  onChange={handleInputChange}
                  placeholder="(11) 99999-9999"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="logo_url">URL do Logo</Label>
              <Input
                id="logo_url"
                name="logo_url"
                value={formData.logo_url}
                onChange={handleInputChange}
                placeholder="https://exemplo.com/logo.png"
              />
            </div>
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Salvando...' : chain ? 'Atualizar' : 'Criar Rede'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ChainForm;