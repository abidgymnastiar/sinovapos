<?php

namespace App\Filament\Widgets;

use Filament\Widgets\StatsOverviewWidget;
use Filament\Widgets\StatsOverviewWidget\Stat;
use App\Models\Product;
use App\Models\Stock;


class StatsOverview extends StatsOverviewWidget
{
    protected function getStats(): array
    {
        return [
            Stat::make('Total Products', Product::count())
                ->description('+5.2%')
                ->descriptionIcon('heroicon-m-arrow-trending-up')
                ->color('success'),
            Stat::make(
                'Total Sisa Stok',
                Stock::sum('closing_stock')
            )
                ->description('Akumulasi stok tersisa')
                ->descriptionIcon('heroicon-m-archive-box')
                ->color('success'),
            Stat::make(
                'Total Terjual',
                Stock::sum('sold')
            )
                ->description('Total seluruh produk terjual')
                ->descriptionIcon('heroicon-m-arrow-trending-down')
                ->color('danger'),
        ];
    }
}
