<?php

namespace App\Filament\Widgets;

use Filament\Widgets\StatsOverviewWidget;
use Filament\Widgets\StatsOverviewWidget\Stat;
use App\Models\Product;


class StatsOverview extends StatsOverviewWidget
{
    protected function getStats(): array
    {
        return [
            Stat::make('Total Produk', Product::count())
                ->description('Jumlah seluruh produk terdaftar')
                ->descriptionIcon('heroicon-m-cube')
                ->color('primary'),
        ];
    }
}
