import React, { useEffect, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import dynamic from 'next/dynamic';
import Form from 'components/forms/form';
import Input from 'components/forms/input';
import Button from 'components/button';
import Typography from 'components/typography';
import MultipleSelect from 'components/forms/selectTags';
import Cover from 'components/forms/cover';
import Ip from 'components/forms/ip';
import confirm from 'components/modal/confirm';
import {
  ServerPostInterface,
  useCreateServer,
  useUpdateServer,
} from 'utils/hooks/useServers';
import toast from 'react-hot-toast';
import { useRouter } from 'next/router';
import slugify from 'slugify';

const { Text, Title } = Typography;

const EditorComponent = dynamic(() => import('./editor'), { ssr: false });

const layout = {
  labelCol: {
    span: 12,
  },
  wrapperCol: {
    span: 12,
  },
};

interface ServerDefaultValues {
  title: string;
  content: string;
  ip: string;
  tags: string[];
  cover: string;
}

const AddServer = ({
  submitText,
  serverId,
  defaultValues,
}: {
  submitText?: string;
  serverId?: number;
  defaultValues?: ServerDefaultValues;
}): JSX.Element => {
  const router = useRouter();
  const form = Form.useForm({
    mode: 'onChange',
    defaultValues,
  });
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const mutation = useCreateServer();

  const onSubmit = (body: ServerPostInterface) => {
    const serverPayload = {
      ...body,
    };

    if (serverId) {
      serverPayload.id = serverId;
    }

    const serverToastId = toast.loading(
      serverId ? 'Modificando il tuo server...' : 'Postando il tuo server...'
    );
    mutation.mutate(serverPayload, {
      onError: () => {
        toast.error(
          serverId
            ? "C'e' stato un problema nel modificare il tuo server."
            : "C'e' stato un problema nel postare il tuo server.",
          {
            id: serverToastId,
            duration: 5000,
          }
        );
      },
      onSuccess: (res) => {
        toast.success(
          serverId
            ? "Il tuo server e' stato modificato."
            : "Il tuo server e' stato postato.",
          {
            id: serverToastId,
            duration: 5000,
          }
        );
        router.push(`/server/${res.id}/${slugify(res.title)}`);
      },
    });
  };

  const editMutation = useUpdateServer();

  const onEdit = (body: ServerPostInterface) => {
    const serverPayload = {
      ...body,
    };

    if (serverId) {
      serverPayload.id = serverId;
    }

    const serverToastId = toast.loading(
      serverId ? 'Modificando il tuo server...' : 'Postando il tuo server...'
    );
    editMutation.mutate(serverPayload, {
      onError: () => {
        toast.error(
          serverId
            ? "C'e' stato un problema nel modificare il tuo server."
            : "C'e' stato un problema nel postare il tuo server.",
          {
            id: serverToastId,
            duration: 5000,
          }
        );
      },
      onSuccess: (res) => {
        toast.success(
          serverId
            ? "Il tuo server e' stato modificato."
            : "Il tuo server e' stato postato.",
          {
            id: serverToastId,
            duration: 5000,
          }
        );
        router.push(`/server/${res.id}/${slugify(res.title)}`);
      },
    });
  };

  const [rules, setRules] = useState('');

  useEffect(() => {
    const loadRules = async () => {
      // eslint-disable-next-line global-require
      const content = await require(`./rules.md`);
      setRules(content.default);
    };
    loadRules();
  }, []);

  return (
    <div className="grid grid-cols-12 gap-4">
      <aside className="col-span-full lg:col-span-3 px-4 pb-4 mt-4 border-r border-gray-100">
        <div className="mb-2">
          <Title level={5}>Regole</Title>
        </div>

        <div className="prose">
          <ReactMarkdown>{rules}</ReactMarkdown>
        </div>
      </aside>

      <main className="col-span-full lg:col-span-8 pr-4 py-4">
        <Form {...layout} form={form}>
          <Form.Item
            label="Nome del server"
            name="title"
            rules={{
              required: {
                value: true,
                message: 'Devi aggiungere il nome del server.',
              },
              minLength: {
                value: 10,
                message: 'Il titolo deve essere almeno 10 caratteri.',
              },
              maxLength: {
                value: 200,
                message: 'Il titolo deve essere meno di 200 caratteri.',
              },
            }}
          >
            <Input type="text" placeholder="Nome del server" name="title" />
          </Form.Item>

          <Form.Item
            name="content"
            label="Descrizione"
            {...layout}
            rules={{
              validate: (value) => {
                const arr = [
                  ...value.matchAll(
                    /!\[[^\]]*\]\(https:[/|.|\w|\s|-]*\.(?:jpg|png|svg|gif)\)/g
                  ),
                ];
                return (
                  arr.length > 1 ||
                  'Assicurati di aggiungere almeno due immagini alla tua descrizione. ![](<immagine>)'
                );
              },
              required: {
                value: true,
                message: 'Devi aggiungere una descrizione.',
              },
              minLength: {
                value: 280,
                message: 'La descrizione deve essere almeno 280 caratteri.',
              },
              maxLength: {
                value: 10000,
                message: 'La descrizione deve essere meno di 10000 caratteri.',
              },
            }}
          >
            {isClient && <EditorComponent name="content" />}
          </Form.Item>

          <Form.Item
            name="ip"
            label="Ip"
            {...layout}
            rules={{
              required: {
                value: true,
                message: "Devi aggiungere un'immagine per il tuo server.",
              },
            }}
          >
            <Ip />
          </Form.Item>

          <Form.Item name="tags" label="Tags" {...layout}>
            <MultipleSelect />
          </Form.Item>

          <Form.Item
            name="cover"
            label="Cover"
            {...layout}
            rules={{
              required: {
                value: true,
                message: "Devi aggiungere un'immagine per il tuo server.",
              },
              pattern: {
                value: /(https:)([/|.|\w|\s|-])*\.(?:jpg|png)/g,
                message: "Il link non è un'immagine valida.",
              },
            }}
          >
            <Cover />
          </Form.Item>
          <div className="mb-2">
            <Text type="secondary">
              La cover è una immagine pubblicitaria per il tuo server. Verra
              visualizzata sulla homepage e sulla pagina personale del tuo
              server. Consigliamo dimensioni <strong>1125x400</strong>.
            </Text>
          </div>
        </Form>
        <div className="flex justify-end">
          {serverId ? (
            <Button
              onClick={async () => {
                form.trigger().then((res) => {
                  if (res)
                    confirm({
                      title: 'Sei sicuro di voler postare questo server?',
                      content:
                        'Aggiungere una buona descrizione e molte immagini é molto importante, assicurati di aver scritto abbastanza da interessare altri utenti!',
                      // eslint-disable-next-line no-console
                      onOk: () => {
                        onEdit({
                          ...form.getValues(),
                          id: serverId,
                        } as ServerPostInterface);
                      },
                      // eslint-disable-next-line no-console
                      onCancel: () => console.log('Cancelled'),
                    });
                });
              }}
            >
              {submitText}
            </Button>
          ) : (
            <Button
              onClick={async () => {
                form.trigger().then((res) => {
                  if (res)
                    confirm({
                      title: 'Sei sicuro di voler postare questo server?',
                      content:
                        'Aggiungere una buona descrizione e molte immagini é molto importante, assicurati di aver scritto abbastanza da interessare altri utenti!',
                      // eslint-disable-next-line no-console
                      onOk: () => {
                        onSubmit(form.getValues() as ServerPostInterface);
                      },
                      // eslint-disable-next-line no-console
                      onCancel: () => console.log('Cancelled'),
                    });
                });
              }}
            >
              {submitText}
            </Button>
          )}
        </div>
      </main>
    </div>
  );
};

AddServer.defaultProps = {
  serverId: null,
  defaultValues: { tags: [] },
  submitText: 'Posta server',
};

export default AddServer;
