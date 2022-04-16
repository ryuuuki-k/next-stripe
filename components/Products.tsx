import { User } from 'firebase/auth';
import {
  addDoc,
  collection,
  getDocs,
  onSnapshot,
  query,
  where,
} from 'firebase/firestore';
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

  const redirectToCheckout = async (priceId: string) => {
    const collectionRef = collection(
      db,
      `customers/${user.uid}/checkout_sessions`
    );

    const docRef = await addDoc(collectionRef, {
      mode: 'payment',
      billing_address_collection: 'auto',
      success_url: window.location.origin,
      cancel_url: window.location.origin,
      line_items: [
        {
          price: priceId,
          tax_rates: ['txr_1Kp0h2FJzMbc3s9lOCtd13aq'],
          quantity: 1,
        },
      ],
    });

    onSnapshot(docRef, (snap) => {
      const { url, error } = snap.data() as { url: string; error: Error };

      if (error) alert(`Error!! ${error.message}`);
      if (url) window.location.assign(url);
    });
  };

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
    <>
      {products?.map((product) => (
        <div key={product.id}>
          <h2>{product.name}</h2>
          <div>
            {product.prices.map((price) => (
              <div key={price.id}>
                <div>
                  {price.description || '通常'} -{' '}
                  {price.unit_amount.toLocaleString()}円
                  <button
                    onClick={() => redirectToCheckout(price.id)}
                    className=" bg-blue-500 text-white hover:bg-blue-900 font-bold m-1 p-1 rounded"
                  >
                    Buy
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </>
  );
};

export default Products;
