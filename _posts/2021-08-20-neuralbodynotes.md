---
title: 'Neural Body Paper Notes'
date: 2021-08-20
permalink: /posts/2021/08/neuralbodynotes/
tags:
  - nerf
  - novel view synthesis
  - paper notes
---

Notes for Sida Peng's paper "Neural Body" (3D human body reconstruction).

![截屏2021-09-24 下午3.18.42.png](https://s3-us-west-2.amazonaws.com/secure.notion-static.com/816521d2-f610-441e-aad3-f79c72178e8f/截屏2021-09-24_下午3.18.42.png)

论文链接：[https://zju3dv.github.io/neuralbody/](https://zju3dv.github.io/neuralbody/)

[Code Structure of Neuralbody](https://www.notion.so/Code-Structure-of-Neuralbody-d625b423df6e4c5781a7c7fb12c4e98d)

Demo：

- 从稀疏视角视频中合成自由视角
- 人物 3D 重建（geometry（extracted from density volumes），appearance）

[https://s3-us-west-2.amazonaws.com/secure.notion-static.com/902db43b-bfad-4c0c-a9f4-23a8f747e52a/97257674-9166-11eb-8224-825df26085ac.mp4](https://s3-us-west-2.amazonaws.com/secure.notion-static.com/902db43b-bfad-4c0c-a9f4-23a8f747e52a/97257674-9166-11eb-8224-825df26085ac.mp4)

局限性：

**cannot synthesize images of novel human poses** as 3D convolution is not equivariant to pose changes

# 1. Introduction

## Problem

生成动态人体的自由视角视频，这有很多应用，包括电影工业，体育直播和远程视频会议，以及实现低成本的子弹时间特效。

## Related work

现在效果最好的视角合成方法主要是NeRF 这个方向的论文，但他们有两个问题：

- 需要非常稠密视角来训练视角合成网络。比如NeRF论文中，一般用了100多个视角来训练网络。
- NeRF只能处理静态场景。现在大部分视角合成工作是对于每个静态场景训一个网络，对于动态场景，上百帧需要训上百个网络，这成本很高。

## Key Idea

在稀疏视角下，单帧的信息不足以恢复正确的3D scene representation。论文通过视频的整合时序信息来获得足够多的3D shape observation。实际生活中的经验是，观看一个动态的物体更能想象他的三维形状。

![https://s3-us-west-2.amazonaws.com/secure.notion-static.com/f325c3df-418a-4aa3-a51b-7a2b4b432351/Untitled.png](https://s3-us-west-2.amazonaws.com/secure.notion-static.com/f325c3df-418a-4aa3-a51b-7a2b4b432351/Untitled.png)

这里整合时序信息的实现用的是latent variable model。具体来说，我们定义了一组隐变量，从同一组隐变量中生成不同帧的场景，这样就把不同帧观察到的信息和一组隐变量关联在了一起。经过训练，我们就能把视频各个帧的信息整合到这组隐变量中，也就整合了时序信息。

# 2. Neural body

> NeRF的网络是一个global implicit function。global的意思是NeRF只用一个MLP网络去记录场景中所有点的颜色和几何信息。
> 

![Implicit neural representation with structured latent codes](https://s3-us-west-2.amazonaws.com/secure.notion-static.com/e81c4f31-a9c5-46ad-a821-6381bb37452a/截屏2021-09-24_下午3.06.20.png)

Implicit neural representation with structured latent codes

## 2.1 Structured latent codes

**Latent codes的生成**：对于某一帧，论文定义了一组离散的 local latent codes 锚定在SMPL人体模型的6890个定点上：

$$
\mathcal{Z}=\left\{\boldsymbol{z}{1}, \boldsymbol{z}{2}, \ldots, \boldsymbol{z}_{6890}\right\}
$$

论文实际使用了浙大三维视觉实验室开源的 [EasyMocap](https://github.com/zju3dv/EasyMocap) ****来从多视角图片 $\left\{\mathcal{I}_{t}^{c} \mid c=1, \ldots, N_{c}\right\}$ 检测每一帧的SMPL模型参数。

然后我们在可驱动的 SMPL 模型的 mesh vertices上摆放latent codes，这里潜码 $z$ 的维度被设置成 16。

因为这些latent codes可随SMPL模型改变空间位置，从同一组 latent codes 中能生成**不同帧**的**动态人物**场景，故称为 structured latent codes。

这组潜码通过一个神经网络，就可以表示局部的几何（geometry）和外貌（appearance(color&density)）。

因为所有帧的场景都是通过这一组潜码来生成的，所以不同帧也就自然地被整合起来了。

[https://s3-us-west-2.amazonaws.com/secure.notion-static.com/6d91c73a-c7cd-49eb-a127-5457802c1aff/d04dbaca-91ec-11eb-b6a3-42bcaec67af6.mp4](https://s3-us-west-2.amazonaws.com/secure.notion-static.com/6d91c73a-c7cd-49eb-a127-5457802c1aff/d04dbaca-91ec-11eb-b6a3-42bcaec67af6.mp4)

这里说是 local implicit function 是因为：相比于NeRF用一个MLP记录整个场景的信息，本文场景的信息记录在local latent codes。比如脸部和手部的 latent codes 分别记录脸和手的 appearance 和 shape information。

## 2.2 Code diffusion

将local latent codes输入到一个3维卷积神经网络 **SparseConvNet**，得到一个`latent code volume`，这样就能通过插值得到空间中的任意一点的latent code。

We compute the 3D bounding box of the human and divide the box into small voxels with voxel size of 5mm × 5mm × 5mm. The latent code of a non-empty voxel is the mean of latent codes of SMPL vertices inside this voxel. **`SparseConvNet`** utilizes 3D sparse convolutions to process the input volume and output latent code volumes with 2×, 4×, 8×, 16× downsampled sizes. With the convolution and downsampling, the input codes are difused to nearby space. Following [56], for any point in 3D space, we interpolate the latent codes from multi-scale code volumes of network layers 5, 9, 13, 17, and concate- nate them into the final latent code.

Since the code diffusion should not be affected by the human position and orientation in the world coordinate system, we transform the code locations to the SMPL coordinate system.

![Architecture of SparseConvNet. Each layer consists of sparse convolution, batch normalization and ReLU.](https://s3-us-west-2.amazonaws.com/secure.notion-static.com/00cebab4-d366-4369-846a-26ac7bef82f6/截屏2021-08-03_下午7.50.49.png)

Architecture of SparseConvNet. Each layer consists of sparse convolution, batch normalization and ReLU.

 $\mathbf x$ 首先被转换到 SMPL 坐标系中，然后使用 trilinear interpolation 扩散潜码到空间的任意位置。

将点 $\mathbf x$ 处的latent code表示为：

$$
\psi\left(\mathbf{x}, \mathcal{Z}, S_{t}\right)
$$

## 2.3 Density and color regression

把潜码 $\psi\left(\mathbf{x}, \mathcal{Z}, S_{t}\right)$ 送入NeRF的网络 (MLP) 中，就能得到相应的 color 和 density。

### **Density model透明度：**

对 *t* 帧，点 $\mathbf x$ 处的 volume density 是潜码的函数，这里使用4层MLP：

$$
\sigma_{t}(\mathbf{x})=M_{\sigma}\left(\psi\left(\mathbf{x}, \mathcal{Z}, S_{t}\right)\right)
$$

### **Color model：**

为每帧添加了一个 latent embedding $\ell_{t}$，使用2层MLP，$\mathbf d$ 表示观察方向。

效法 NeRF 中的 positional encoding，这里也对观察方向和位置进行了位置编码 $\gamma()$ 。

$$
\mathbf{c}_{t}(\mathbf{x})=M_{\mathbf{c}}\left(\psi\left(\mathbf{x}, \mathcal{Z}, S_{t}\right), \gamma_{\mathbf{d}}(\mathbf{d}), \gamma_{\mathbf{x}}(\mathbf{x}), \boldsymbol{\ell}_{t}\right)
$$

## 2.4 Volume rendering

用于生成不同视角观察到的图片。

第 *t* 帧，在SMPL模型的近端和远端附近，沿相机光线 $*\mathbf c$* 采样 $N_k$ 个点，最后每个像素点渲染出来的颜色 $\tilde{C}_{t}(\mathbf{r})$ 是

$$
\begin{gathered}
\tilde{C}_{t}(\mathbf{r})=\sum_{k=1}^{N_{k}} T_{k}\left(1-\exp \left(-\sigma_{t}\left(\mathbf{x}_{k}\right) \delta_{k}\right)\right) \mathbf{c}_{t}\left(\mathbf{x}_{k}\right) \\
\text { where } \quad T_{k}=\exp \left(-\sum_{j=1}^{k-1} \sigma_{t}\left(\mathbf{x}_{j}\right) \delta_{j}\right)
\end{gathered}
$$

其中，$\delta_{k}=\left\|\mathbf{x}_{k+1}-\mathbf{x}_{k}\right\|_2$  是相邻两个采样点之间的距离。在实验中，$N_k$ 被设置成 64。 

## 2.5 Training

我们通过最小化体渲染出来的图片和真实图片的差异优化 neural body。

$$
minimize \sum_{t=1}^{N_{t}} \sum_{c=1}^{N_{c}} L\left(\mathcal{I}_{t}^{c}, P^{c} ; \ell_{t}, \mathcal{Z}, \Theta\right)
$$

其中 $\Theta$ 表示网络参数；$P^{c}$ 是相机参数；$L$ 是渲染出来图片和真实图片之间的 total square error，对应的损失函数是：

$$
L=\sum_{\mathbf{r} \in \mathcal{R}}\|\tilde{C}(\mathbf{r})-C(\mathbf{r})\|_{2}^{2}
$$

像NeRF一样，论文用 volume rendering 从图片中优化网络参数。通过在整段视频上训练，Neural Body实现了时序信息的整合。

## 2.6 Applications

训练完成后的neural body既可以用来合成新视角，也可以用于三维重建。

三维重建的具体方法是：首先将场景离散成一个个 $5mm × 5mm × 5mm$ 的体素，然后算出所有体素的 volume density 体密度，并且使用 Marching Cubes 算法提取出人体的mesh。 

# 3 Experiments

## 3.1 Novel view synthesis

![截屏2021-09-24 下午5.01.31.png](https://s3-us-west-2.amazonaws.com/secure.notion-static.com/053996bc-cf15-4305-8cc7-39d9c7aeb54e/截屏2021-09-24_下午5.01.31.png)

![截屏2021-09-24 下午5.02.12.png](https://s3-us-west-2.amazonaws.com/secure.notion-static.com/54f0c911-8a58-4672-97ed-63e207ada68c/截屏2021-09-24_下午5.02.12.png)

## 3.2 3D reconstruction

![截屏2021-09-24 下午5.03.19.png](https://s3-us-west-2.amazonaws.com/secure.notion-static.com/379959f4-73b1-4516-af03-29ff93f2b2a0/截屏2021-09-24_下午5.03.19.png)

![截屏2021-09-24 下午5.03.45.png](https://s3-us-west-2.amazonaws.com/secure.notion-static.com/8e3a552b-f390-4c2f-ab2b-b2870eb16c30/截屏2021-09-24_下午5.03.45.png)

[spconv环境配置问题解决方案](https://www.notion.so/spconv-5f80280b21f74c879431a2a1854e5b7f)