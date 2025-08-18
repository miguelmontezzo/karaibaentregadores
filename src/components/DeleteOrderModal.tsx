import { useState } from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Trash2, AlertTriangle } from 'lucide-react';
import { Order } from '@/types/order';

interface DeleteOrderModalProps {
  order: Order;
  onDelete: (orderId: string) => void;
  isDeleting: boolean;
}

const DeleteOrderModal = ({ order, onDelete, isDeleting }: DeleteOrderModalProps) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleDelete = () => {
    onDelete(order.id);
    setIsOpen(false);
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
      <AlertDialogTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          disabled={isDeleting}
          className="text-xs py-1 h-6 text-red-600 hover:text-red-700 hover:bg-red-50"
        >
          <Trash2 className="w-3 h-3" />
        </Button>
      </AlertDialogTrigger>
      
      <AlertDialogContent className="sm:max-w-md">
        <AlertDialogHeader>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-100">
              <AlertTriangle className="h-5 w-5 text-red-600" />
            </div>
            <div>
              <AlertDialogTitle className="text-lg font-semibold">
                Excluir Pedido
              </AlertDialogTitle>
              <AlertDialogDescription className="text-sm text-muted-foreground mt-1">
                Esta ação não pode ser desfeita.
              </AlertDialogDescription>
            </div>
          </div>
        </AlertDialogHeader>
        
        <div className="my-4 p-4 bg-gray-50 rounded-lg border">
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="font-medium">Cliente:</span>
              <span>{order.nome_cliente || "Não informado"}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium">Pedido:</span>
              <span>{order.codigo_pedido || "N/A"}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium">Status:</span>
              <span className="text-red-600 font-medium">{order.status}</span>
            </div>
          </div>
        </div>
        
        <AlertDialogDescription className="text-center text-sm text-muted-foreground">
          Tem certeza que deseja excluir este pedido permanentemente?
        </AlertDialogDescription>

        <AlertDialogFooter className="flex gap-2 sm:gap-2">
          <AlertDialogCancel className="flex-1">
            Cancelar
          </AlertDialogCancel>
          <AlertDialogAction 
            onClick={handleDelete}
            disabled={isDeleting}
            className="flex-1 bg-red-600 hover:bg-red-700 focus:ring-red-600"
          >
            {isDeleting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Excluindo...
              </>
            ) : (
              <>
                <Trash2 className="w-4 h-4 mr-2" />
                Excluir Pedido
              </>
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default DeleteOrderModal;