<?php

namespace Database\Seeders;

use App\Models\Product;
use Illuminate\Database\Seeder;

class ProductSeeder extends Seeder
{
    public function run(): void
    {
        Product::insert([
            [
                'image' => 'products/nasi-goreng.jpg',
                'name' => 'Nasi Goreng',
                'category' => 'makanan',
                'price' => 15000,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'image' => 'products/ayam-goreng.jpg',
                'name' => 'Ayam Goreng',
                'category' => 'makanan',
                'price' => 18000,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'image' => 'products/es-teh.jpg',
                'name' => 'Es Teh',
                'category' => 'minuman',
                'price' => 5000,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'image' => 'products/kopi-hitam.jpg',
                'name' => 'Kopi Hitam',
                'category' => 'minuman',
                'price' => 8000,
                'created_at' => now(),
                'updated_at' => now(),
            ],
        ]);
    }
}
