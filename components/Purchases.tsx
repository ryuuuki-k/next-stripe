import { User } from 'firebase/auth';
import { useEffect, useState } from 'react';
import { NextPage } from 'next';
import {
  collection,
  onSnapshot,
  orderBy,
  query,
  SnapshotMetadata,
  where,
} from 'firebase/firestore';
import { db } from '../lib/firebase';

type Purchase = {
  id: string;
  status?: 'succeeded';
  created: number;
  items: {
    description: string;
    price: {
      id: string;
      nickname: string;
      unit_amount: number;
    };
  }[];
};

type Props = {
  user: User;
};

const Purchases: NextPage<Props> = ({ user }) => {
  const [purchases, setPurchases] = useState<Purchase[]>();

  useEffect(() => {
    const ref = collection(db, `customers/${user.uid}/payments`);
    const q = query(
      ref,
      where('status', '==', 'succeeded'),
      orderBy('created', 'desc')
    );

    return onSnapshot(q, (result) => {
      setPurchases(result.docs.map((doc) => doc.data() as Purchase));
    });
  }, []);

  return (
    <>
      <h2>購入履歴</h2>
      <ul>
        {purchases?.map((purchase) => {
          const price = purchase.items[0].price;
          return (
            <>
              <li>
                <div>{purchase.items[0].description}</div>
              </li>
              <li>
                <div>{price.unit_amount.toLocaleString()}円 </div>
              </li>
              <li>
                <div>{purchase.created}</div>
              </li>
            </>
          );
        })}
      </ul>
    </>
  );
};

export default Purchases;
