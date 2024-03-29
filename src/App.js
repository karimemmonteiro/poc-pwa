import React, { useState, useEffect } from 'react';
import { LoadingOutlined } from '@ant-design/icons';
import localforage from 'localforage';
import axios from 'axios';
import { Badge, message, Spin } from 'antd';

const App = () => {
  const [data, setData] = useState([]);
  const [messageApi, contextHolder] = message.useMessage();
  const [online, setOnline] = useState(navigator.onLine);
  const [inputName, setInputName] = useState('');
  const [inputValue, setInputValue] = useState(0);
  const [inputAmount, setInputAmount] = useState(0);
  const [loading, setLoading] = useState(false);
  const validacaoSalvar = inputName !== "" && inputValue !== 0 && inputAmount !== 0;
  const validaçaoSicronizar = data.length > 0 && online

  const fetchData = async () => {
    try {
      const storedData = await localforage.getItem('DataOffiline');
      console.log('Dados Locais Antes:', storedData);
      const response = await axios.get('https://x8ki-letl-twmt.n7.xano.io/api:XrvEIpMk/produtos');
      const newData = response.data;
      console.log('Dados da API:', newData);
      const combinedData = storedData ? [...storedData, ...newData] : newData;
      console.log('Dados Combinados:', combinedData, "dados api", newData);
      if (combinedData.length > 0) {
        setData(combinedData);
      } else {
        setData(combinedData);
      }
      if(!online){
        setData(storedData)
      }
    } catch (error) {
      console.error("Erro ao obter dados:", error);
      setLoading(false);
    }
  };

  const handleSaveOffline = () => {
    const newItem = {
      name: inputName,
      value: inputValue,
      amount: inputAmount,
      status: false
    };

    const newData = [...data, newItem];

    if (online) {
      setLoading(true);
      console.log("teste status", newData);

      const syncItem = (index) => {
        const currentItem = newData[index];

        // Verifique o status usando currentItem.status
        if (currentItem.status === false) {
          console.log("teste status========================================", newData);
          currentItem.status = true;
          console.log("teste status", currentItem.status);

          axios.post('https://x8ki-letl-twmt.n7.xano.io/api:XrvEIpMk/produtos', currentItem)
            .then(() => {
              if (index < newData.length - 1) {
                syncItem(index + 1);
              } else {
                localforage.setItem('DataOffiline', []).then(() => {
                  setData([]);
                  fetchData();
                  setTimeout(() => {
                    setLoading(false);
                  }, 4000);
                });
              }
            })
            .catch((error) => {
              console.error("Erro ao sincronizar dados:", error);
              setTimeout(() => {
                setLoading(false);
              }, 4000);
            });
        } else {
          if (index < newData.length - 1) {
            syncItem(index + 1);
          } else {
            localforage.setItem('DataOffiline', []).then(() => {
              setData([]);
              setTimeout(() => {
                setLoading(false);
              }, 4000);
            });
          }
        }
      };

      syncItem(0);

    } else {
      localforage.getItem('DataOffiline').then((offlineData) => {
        const updatedOfflineData = offlineData ? [...offlineData, newItem] : [newItem];
        localforage.setItem('DataOffiline', updatedOfflineData).then(() => {
          // Use newData aqui para atualizar os dados localmente
          setData(newData);
        });
      });
    }

    setInputName('');
    setInputValue(0);
    setInputAmount(0);
  };



  const handleSyncOnline = () => {
    setLoading(true);
    console.log('testejhdnfklasdjklfjlsdkjflds======')

    if (data.length === 0) {
      console.log("Nenhum dado para sincronizar.");
      setLoading(false);
      return;
    }

    const syncItem = (index) => {
      const currentItem = data[index];
      setTimeout(() => {
        setLoading(false);
      }, 4000);
      if (currentItem.status !== true) {
        currentItem.status = true;

        axios.post('https://x8ki-letl-twmt.n7.xano.io/api:XrvEIpMk/produtos', currentItem)
          .then(() => {
            if (index < data.length - 1) {
              syncItem(index + 1);
            } else {
              localforage.setItem('DataOffiline', []).then(() => {
                setData([]);
                fetchData();
                setTimeout(() => {
                  setLoading(false);
                }, 4000);
              });
            }
          })
          .catch((error) => {
            console.error("Erro ao sincronizar dados:", error);
            setTimeout(() => {
              setLoading(false);
            }, 4000);
          });
      } else {
        if (index < data.length - 1) {
          syncItem(index + 1);
        } else {
          localforage.setItem('DataOffiline', []).then(() => {
            setData([]);
            setTimeout(() => {
              setLoading(false);
            }, 4000);
          });
        }
      }
    };

    syncItem(0);
  };

  useEffect(() => {
    fetchData();
  }, []);



  useEffect(() => {
    const handleOnlineStatusChange = () => {
      setOnline(navigator.onLine);

    };

    window.addEventListener('online', handleOnlineStatusChange);
    window.addEventListener('offline', handleOnlineStatusChange);
    return () => {
      window.removeEventListener('online', handleOnlineStatusChange);
      window.removeEventListener('offline', handleOnlineStatusChange);
    };
  }, []);

  useEffect(() => {
    console.log("teste validaçao", validaçaoSicronizar)
    if (validaçaoSicronizar) {
      handleSyncOnline()
    }
    if (!online) {
      warning()
    } else {
      success()
    }
  }, [online])


  function warning() {
    messageApi.open({
      type: 'warning',
      content: 'Sistema Desconectado',
    });
  };
  function success() {
    messageApi.open({
      type: 'success',
      content: 'Sistema Conectado',
    });
  };


  return (
    <div style={{ display: "flex", flexDirection: "column", width: "100svw", }}>
      {contextHolder}
      <div style={{ paddingLeft: "2rem", display: "flex", flexDirection: "row", alignItems: "center", gap: 30 }} >
        <h1 style={{ color: "#005eb8", display: "flex", flexDirection: "row" }}>
          Lista de Produtos -

        </h1>
        {
          online ? <h2 style={{ color: "green" }}> {loading ? "Sicronizando..." : "Online"}</h2> : <h2 style={{ color: "red" }}>
            Offline
          </h2>
        }
        {
          !loading ? null
            : <Spin
              indicator={
                <LoadingOutlined
                  style={{
                    fontSize: 24,
                  }}
                  spin
                />
              }
            />
        }


      </div>
      <div style={{ background: "#005eb8", display: "flex", flexDirection: "row", justifyContent: "flex-start", alignItems: "end", marginBottom: "2rem", paddingLeft: "2rem", gap: 10 }}>
        <div style={{ display: "flex", flexDirection: "column", color: "white" }}>
          <span>Nome do Produto</span>
          <input
            style={{
              padding: '10px',
              fontSize: '16px',
              border: '1px solid #ccc',
              borderRadius: '5px',
              width: '500px',
              margin: '10px 0',
              boxSizing: 'border-box',
            }}
            type="text"
            name='name'
            placeholder='Ex: açai'
            value={inputName}
            onChange={(e) => setInputName(e.target.value)}
          />
        </div>
        <div style={{ display: "flex", flexDirection: "column", color: "white" }}>
          <span>Valor</span>
          <input
            style={{
              padding: '10px',
              fontSize: '16px',
              border: '1px solid #ccc',
              borderRadius: '5px',
              width: '200px',
              margin: '10px 0',
              boxSizing: 'border-box',
            }}
            type="number"
            name='value'
            placeholder='00.00'
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
          />
        </div>
        <div style={{ display: "flex", flexDirection: "column", color: "white" }}>
          <span>Quandidade</span>
          <input
            style={{
              padding: '10px',
              fontSize: '16px',
              border: '1px solid #ccc',
              borderRadius: '5px',
              width: '200px',
              margin: '10px 0',
              boxSizing: 'border-box',
            }}
            type="number"
            name='amount'
            placeholder='0'
            value={inputAmount}
            onChange={(e) => setInputAmount(e.target.value)}
          />
        </div>
        <button style={{
          backgroundColor: !validacaoSalvar ? '#bdc3c7' : '#3498db',
          color: !validacaoSalvar ? '#7f8c8d' : '#fff',
          padding: '10px 20px',
          border: 'none',
          borderRadius: '5px',
          marginBottom: "0.7rem",
          cursor: !validacaoSalvar ? 'not-allowed' : 'pointer',
        }} disabled={!validacaoSalvar} onClick={handleSaveOffline}>Salvar Offline</button>

      </div>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", paddingTop: "0.5rem", padding: "10px", boxShadow: "5px 5px 10px #888", minHeight: "20rem" }}>
        <table style={{ width: "100%", marginTop: "2rem" }}>
          <tr style={{
            width: "100%",
            background: "#005eb8",
            color: "white",
            height: "2rem"
          }}>
            <th style={{ width: "50%" }}>Nome</th>
            <th style={{ width: "15%" }}>Valor</th>
            <th style={{ width: "15%" }}>Quantidade</th>
            <th style={{ width: "20%" }}>Status de Sincronização</th>
          </tr>

          {data.map((item, index) => (
            <tr style={{
              width: "100%",
            }} key={index}>
              <td style={{ fontWeight: "bold", paddingLeft: "1rem" }} >{item.name}</td>
              <td style={{ fontWeight: "bold", paddingLeft: "1rem" }} >R$ {item.value}</td>
              <td style={{ fontWeight: "bold", paddingLeft: "1rem" }} >{item.amount}</td>
              <td style={{ fontWeight: "bold", display: "flex", flexDirection: "row", justifyContent: "center", gap: 10, color: item.status ? "green" : "orange" }} >{item.status ? "CONCLUIDO" : "PENDENTE"}</td>
            </tr>
          ))}

        </table>
      </div>
      <div style={{ width: "100vw", display: "flex", justifyContent: "center", gap: 10, paddingTop: "2rem" }}>
        {
          !online ?
            // <div style={{ width: "5rem" }}>

            //   <Result
            //     iconFontSize={10}


            //     status="500"
            //     title="500"
            //     subTitle="Sorry, something went wrong."
            //     extra={<Button type="primary">Back Home</Button>}
            //   />
            // </div>
            null
            : null
        }
      </div>

    </div>
  );
};

export default App;
