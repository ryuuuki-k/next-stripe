import { User } from 'firebase/auth';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { NextPage } from 'next';
import { useEffect, useState } from 'react';
import { db } from '../lib/firebase';

type Props = {
  user: User;
};

type Price = {
  id: string;
  description: string;
  unit_amount: number;
};

type Product = {
  id: string;
  active: boolean;
  name: string;
  prices: Price[];
};

const Products: NextPage<Props> = ({ user }) => {
  const [products, setProducts] = useState<Product[]>();

  useEffect(() => {
    const ref = collection(db, 'products');
    const q = query(ref, where('active', '==', true));
    getDocs(q).then(async (snap) => {
      const promises = snap.docs.map(async (doc) => {
        const product = {
          ...(doc.data() as Product),
          id: doc.id,
        };

        const priceRef = collection(db, doc.ref.path, 'prices');
        const priceSnap = await getDocs(priceRef);
        product.prices = priceSnap.docs.map(
          (doc) => ({ ...doc.data(), id: doc.id } as Price)
        );

        return product as Product;
      });

      setProducts(await Promise.all(promises));
    });
  });

  return (
    <div>
      <div>
        {products?.map((product) => (
          <div key={product.id}>
            <h2>{product.name}</h2>
            <p>
              {product.prices.map((price) => (
                <div key={price.id}>
                  <div>
                    {price.description || '通常'} -{' '}
                    {price.unit_amount.toLocaleString()}円
                  </div>
                </div>
              ))}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Products;
