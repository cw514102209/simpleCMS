import React, { useEffect, useCallback, useContext, useState } from 'react'
import { Form, message, Spin, Input, Upload, Button } from 'antd'
import { connect, Dispatch } from 'umi'

import FormattedMsg from '@/components/reactIntl/FormattedMsg'
import UploadBtn from '@/components/uploadBtn'
import { ConnectState } from '@/models/connect'
import { IntlContext } from '@/utils/context/intl'
import { getBase64, SERVER_URL } from '@/utils'

import styles from './index.less'

interface AdvertProps {
  dispatch: Dispatch
  isLoading: boolean
}

const layout = {
  labelCol: { span: 6 },
  wrapperCol: { span: 18 },
}

const Advert: (props: AdvertProps) => JSX.Element = ({ dispatch, isLoading }) => {
  const formatMsg = useContext<any>(IntlContext)
  const [form] = Form.useForm()

  const [topLoading, setTopLoading] = useState<boolean>(false)
  const [sideLoading, setSideLoading] = useState<boolean>(false)
  const [topImageUrl, setTopImageUrl] = useState<string>('')
  const [sideImageUrl, setSideImageUrl] = useState<string>('')

  const onUpload = useCallback((type: string, info: any) => {
    if (info.file.status === 'uploading') {
      type === 'top' ? setTopLoading(true) : setSideLoading(true)
      return
    }
    if (info.file.status === 'done') {
      getBase64(info.file.originFileObj, (imageUrl: string) => {
        type === 'top' ? setTopLoading(false) : setSideLoading(false)
        type === 'top' ? setTopImageUrl(imageUrl) : setSideImageUrl(imageUrl)
        message.success(`${info.file.name} ${formatMsg('Uploaded successfully')}`)
      })
    } else if (info.file.status === 'error') {
      message.error(`${info.file.name} ${formatMsg('Uploaded failed')}`)
    }
  }, [formatMsg])

  const onFinish = useCallback((values: any) => {
    const { topLink, topText, sideLink, sideText } = values
    const finalValues = {
      topAd: {
        link: topLink,
        imageUrl: topImageUrl,
        text: topText,
      },
      sideAd: {
        link: sideLink,
        imageUrl: sideImageUrl,
        text: sideText,
      },
    }
    dispatch({ type: 'advert/save', payload: finalValues }).then(() => {
      message.success(formatMsg('Update successful'))
    })
  }, [formatMsg, topImageUrl, sideImageUrl])

  useEffect(() => {
    dispatch({ type: 'advert/get' }).then((res: any) => {
      if (res.topAd) {
        const { link, imageUrl, text } = res.topAd
        form.setFieldsValue({
          topLink: link,
          topImageUrl: imageUrl,
          topText: text,
        })
        imageUrl && setTopImageUrl(imageUrl)
      }
      if (res.sideAd) {
        const { link, imageUrl, text } = res.sideAd
        form.setFieldsValue({
          sideLink: link,
          sideImageUrl: imageUrl,
          sideText: text,
        })
        imageUrl && setSideImageUrl(imageUrl)
      }
    })
  }, [])

  return (
    <div className={styles.advertWrapper}>
      <Spin spinning={isLoading}>
        <Form
          {...layout}
          form={form}
          name="advertForm"
          onFinish={onFinish}
        >
          <header className={styles.header}>
            <FormattedMsg id="Top advert" />
          </header>
          <Form.Item
            label={<FormattedMsg id="Link" />}
            name="topLink"
            rules={[{ required: true, message: <FormattedMsg id="Please enter the link" /> }]}
          >
            <Input placeholder={formatMsg('Please enter the link')} />
          </Form.Item>
          <Form.Item
            label={<FormattedMsg id="Picture" />}
            name="topImageUrl"
            rules={[{ required: true, message: <FormattedMsg id="Please upload pictures" /> }]}
          >
            <Upload
              name="file"
              listType="picture-card"
              action={`http://${SERVER_URL}/api/v0/files/upload/free`}
              onChange={onUpload.bind(this, 'top')}
              showUploadList={false}
            >
              {topImageUrl ? <img src={topImageUrl} alt="topImage" style={{ width: '100%' }} /> : <UploadBtn loading={topLoading} />}
            </Upload>
          </Form.Item>
          <Form.Item
            label={<FormattedMsg id="Text description" />}
            name="topText"
            rules={[{ required: true, message: <FormattedMsg id="Please enter a description" /> }]}
          >
            <Input.TextArea
              autoSize={{ minRows: 3 }}
              placeholder={formatMsg('Please enter a description')}
            />
          </Form.Item>
          <header className={styles.header}>
            <FormattedMsg id="Side advert" />
          </header>
          <Form.Item
            label={<FormattedMsg id="Link" />}
            name="sideLink"
            rules={[{ required: true, message: <FormattedMsg id="Please enter the link" /> }]}
          >
            <Input placeholder={formatMsg('Please enter the link')} />
          </Form.Item>
          <Form.Item
            label={<FormattedMsg id="Picture" />}
            name="sideImageUrl"
            rules={[{ required: true, message: <FormattedMsg id="Please upload pictures" /> }]}
          >
            <Upload
              name="file"
              listType="picture-card"
              action={`http://${SERVER_URL}/api/v0/files/upload/free`}
              onChange={onUpload.bind(this, 'side')}
              showUploadList={false}
            >
              {sideImageUrl ? <img src={sideImageUrl} alt="sideImage" style={{ width: '100%' }} /> : <UploadBtn loading={sideLoading} />}
            </Upload>
          </Form.Item>
          <Form.Item
            label={<FormattedMsg id="Text description" />}
            name="sideText"
            rules={[{ required: true, message: <FormattedMsg id="Please enter a description" /> }]}
          >
            <Input.TextArea
              autoSize={{ minRows: 3 }}
              placeholder={formatMsg('Please enter a description')}
            />
          </Form.Item>
          <Form.Item style={{ float: 'right' }}>
            <Button type="primary" htmlType="submit">
              <FormattedMsg id="Publish advert" />
            </Button>
          </Form.Item>
        </Form>
      </Spin>
    </div>
  )
}

export default connect(({ advert }: ConnectState) => ({
  isLoading: advert.isLoading,
}))(Advert)