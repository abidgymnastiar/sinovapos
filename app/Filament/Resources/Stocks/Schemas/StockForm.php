<?php

namespace App\Filament\Resources\Stocks\Schemas;

use Filament\Schemas\Schema;
use Filament\Forms\Components\DatePicker;
use Filament\Forms\Components\Select;
use Filament\Forms\Components\TextInput;

class StockForm
{
    public static function configure(Schema $schema): Schema
    {
        return $schema
            ->components([
                // Product selection
                Select::make('product_id')
                    ->label('Product')
                    ->relationship('product', 'name') // assuming product relationship is set
                    ->required(),

                // Date field
                DatePicker::make('date')
                    ->label('Date')
                    ->required()
                    ->default(now()),

                // Opening stock input
                TextInput::make('opening_stock')
                    ->label('Opening Stock')
                    ->numeric()
                    ->required()
                    ->minValue(0),

                // Closing stock input
                TextInput::make('closing_stock')
                    ->label('Closing Stock')
                    ->numeric()
                    ->nullable()
                    ->minValue(0),

                // TextInput::make('sold')
                //     ->label('Sold')
                //     ->readonly()
            ]);
    }
}
