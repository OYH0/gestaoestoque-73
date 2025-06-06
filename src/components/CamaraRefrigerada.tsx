
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Thermometer, Clock, ArrowRight, ArrowLeft } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

const initialItems = [
  { id: 1, name: 'Picanha Bovina', quantidade: 5, tempoDescongelamento: '2h', status: 'descongelando' },
  { id: 2, name: 'Fraldinha', quantidade: 3, tempoDescongelamento: '1h 30m', status: 'descongelando' },
  { id: 3, name: 'Costela Suína', quantidade: 8, tempoDescongelamento: '45m', status: 'pronto' },
  { id: 4, name: 'Coração de Frango', quantidade: 2, tempoDescongelamento: '30m', status: 'pronto' },
];

export function CamaraRefrigerada() {
  const [items, setItems] = useState(initialItems);

  const moveToReady = (id: number) => {
    setItems(items.map(item => 
      item.id === id 
        ? { ...item, status: 'pronto', tempoDescongelamento: 'Pronto' }
        : item
    ));
    toast({
      title: "Item pronto",
      description: "A carne está pronta para uso!",
    });
  };

  const moveToFreezer = (id: number) => {
    setItems(items.filter(item => item.id !== id));
    toast({
      title: "Movido para câmara fria",
      description: "Item foi movido de volta para a câmara fria!",
    });
  };

  const removeFromChamber = (id: number) => {
    setItems(items.filter(item => item.id !== id));
    toast({
      title: "Item retirado",
      description: "Item foi retirado da câmara refrigerada!",
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center">
            <Thermometer className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Câmara Refrigerada</h2>
            <p className="text-gray-600">Carnes em processo de descongelamento</p>
          </div>
        </div>
        <Badge variant="secondary" className="bg-green-100 text-green-800">
          {items.length} itens descongelando
        </Badge>
      </div>

      {/* Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="border-orange-200 bg-orange-50">
          <CardHeader className="pb-3">
            <CardTitle className="text-orange-800 flex items-center gap-2">
              <Clock className="w-4 h-4" />
              Descongelando
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {items.filter(item => item.status === 'descongelando').length}
            </div>
            <p className="text-sm text-orange-700">Itens em processo</p>
          </CardContent>
        </Card>

        <Card className="border-green-200 bg-green-50">
          <CardHeader className="pb-3">
            <CardTitle className="text-green-800 flex items-center gap-2">
              <Thermometer className="w-4 h-4" />
              Prontos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {items.filter(item => item.status === 'pronto').length}
            </div>
            <p className="text-sm text-green-700">Prontos para uso</p>
          </CardContent>
        </Card>
      </div>

      {/* Lista de itens */}
      <div className="grid gap-4">
        {items.map((item) => (
          <Card 
            key={item.id} 
            className={`${
              item.status === 'pronto' 
                ? 'border-green-200 bg-green-50' 
                : 'border-orange-200 bg-orange-50'
            }`}
          >
            <CardContent className="p-4">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <h3 className="font-semibold text-gray-900">{item.name}</h3>
                    <Badge 
                      variant={item.status === 'pronto' ? 'default' : 'secondary'}
                      className={
                        item.status === 'pronto' 
                          ? 'bg-green-500 text-white' 
                          : 'bg-orange-500 text-white'
                      }
                    >
                      {item.status === 'pronto' ? 'Pronto' : 'Descongelando'}
                    </Badge>
                  </div>
                  <div className="mt-1 flex items-center gap-4 text-sm text-gray-600">
                    <span>{item.quantidade} kg</span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {item.tempoDescongelamento}
                    </span>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  {item.status === 'descongelando' ? (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => moveToReady(item.id)}
                      className="text-green-600 border-green-300 hover:bg-green-50"
                    >
                      <ArrowRight className="w-3 h-3 mr-1" />
                      Marcar como Pronto
                    </Button>
                  ) : (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => removeFromChamber(item.id)}
                      className="text-blue-600 border-blue-300 hover:bg-blue-50"
                    >
                      Retirar da Câmara
                    </Button>
                  )}
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => moveToFreezer(item.id)}
                    className="text-blue-600 border-blue-300 hover:bg-blue-50"
                  >
                    <ArrowLeft className="w-3 h-3 mr-1" />
                    Voltar ao Freezer
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Instruções */}
      <Card className="border-blue-200 bg-blue-50">
        <CardContent className="p-4">
          <h4 className="font-semibold text-blue-900 mb-2">Instruções de Descongelamento</h4>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• Carnes pequenas (até 2kg): 30-45 minutos</li>
            <li>• Carnes médias (2-5kg): 1-2 horas</li>
            <li>• Carnes grandes (acima de 5kg): 3-4 horas</li>
            <li>• Sempre manter na temperatura de 2-4°C</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
