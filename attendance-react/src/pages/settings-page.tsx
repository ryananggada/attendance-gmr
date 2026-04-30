import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { deleteUploads } from '@/services/setting-service';
import { useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';

export default function SettingsPage() {
  const deleteMutation = useMutation({
    mutationFn: deleteUploads,
    onSuccess: () => {
      toast.success('Semua foto berhasil dihapus');
    },
    onError: (err) => {
      toast.error(String(err));
    },
  });

  return (
    <div className="grid md:grid-cols-2 gap-4">
      <Card>
        <CardHeader>
          <CardTitle>Hapus Gambar</CardTitle>
        </CardHeader>
        <CardContent>
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="destructive">Hapus</Button>
            </DialogTrigger>

            <DialogContent>
              <DialogTitle>Hapus semua foto?</DialogTitle>

              <DialogDescription>
                Semua foto absen akan dihapus permanen.
              </DialogDescription>

              <DialogFooter>
                <DialogClose asChild>
                  <Button variant="secondary">Batal</Button>
                </DialogClose>

                <DialogClose asChild>
                  <Button
                    variant="destructive"
                    disabled={deleteMutation.isPending}
                    onClick={() => deleteMutation.mutate()}
                  >
                    {deleteMutation.isPending ? 'Menghapus...' : 'Hapus'}
                  </Button>
                </DialogClose>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </CardContent>
      </Card>
    </div>
  );
}
